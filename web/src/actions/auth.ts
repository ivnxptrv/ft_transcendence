"use server";

import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";

import {
  ACCESS_COOKIE,
  IDENTITY_URL,
  REFRESH_COOKIE,
  getAuthConfig,
  type TokenPair,
} from "@/lib/auth-shared";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";

async function setAuthCookies(pair: TokenPair) {
  const cookieStore = await cookies();
  const config = await getAuthConfig();
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  cookieStore.set(ACCESS_COOKIE, pair.access_token, {
    ...common,
    maxAge: pair.expires_in,
  });
  // Refresh TTL comes from identity discovery so the cookie disappears at
  // roughly the same time the server-side row expires.
  cookieStore.set(REFRESH_COOKIE, pair.refresh_token, {
    ...common,
    maxAge: config.refresh_ttl_seconds,
  });
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

// -- Login (single-page progressive OTP) ---
//
// 2FA is folded into the password grant: identity replies 401
// {totp_required:true} when a code is needed, and the page reveals the OTP
// field and re-submits the same form with `otp`. No challenge token, no
// second page, no password stashed in a cookie.

export type LoginState = { error?: string; totpRequired?: boolean };

export async function login(
  _prev: LoginState,
  data: FormData,
): Promise<LoginState> {
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const otp = ((data.get("otp") as string | null) ?? "").trim();

  const config = await getAuthConfig();
  const res = await fetch(`${IDENTITY_URL}${config.token_endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "password",
      email,
      password,
      ...(otp ? { otp } : {}),
    }),
    cache: "no-store",
  });

  if (res.status === 401) {
    const body = (await res.json().catch(() => ({}))) as {
      totp_required?: boolean;
    };
    if (body.totp_required) {
      // Code needed: reveal the OTP field. If we already sent one, it was wrong.
      return { totpRequired: true, error: otp ? "Invalid code, try again" : undefined };
    }
    return { error: "Invalid email or password" };
  }
  if (!res.ok) {
    const body = await res.text();
    console.error(`[login] identity ${res.status}: ${body}`);
    return { error: "Something went wrong, please try again" };
  }

  await setAuthCookies((await res.json()) as TokenPair);
  redirect("/dashboard");
}

export type SignupState = { error?: string };

export async function signup(
  _prev: SignupState,
  data: FormData,
): Promise<SignupState> {
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const role = data.get("role") as string;
  if (role !== "client" && role !== "insider") {
    return { error: "Please choose an account type." };
  }

  const config = await getAuthConfig();
  const res = await fetch(`${IDENTITY_URL}${config.register_endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      role,
      first_name: firstName,
      last_name: lastName,
    }),
    cache: "no-store",
  }).catch(() => null);

  // Network/transport failure — identity unreachable.
  if (!res) return { error: "Something went wrong, please try again." };

  if (!res.ok) {
    // 409: the email is already registered — the common, actionable case.
    if (res.status === 409) {
      return { error: "An account with this email already exists." };
    }
    // 422: surface identity's field-level validation message when present.
    if (res.status === 422) {
      const body = (await res.json().catch(() => ({}))) as {
        detail?: { msg?: string }[];
      };
      return { error: body.detail?.[0]?.msg ?? "Some details are invalid. Please check and try again." };
    }
    console.error(`[signup] identity ${res.status}: ${await res.text()}`);
    return { error: "Something went wrong, please try again." };
  }

  await setAuthCookies((await res.json()) as TokenPair);
  redirect("/dashboard");
}

// -- TOTP management actions ---
//
// All require a logged-in user; they forward the caller's bearer token and
// address the user's own resource by sub (read from the access token).
//   enroll2FA  → Result<{secret, otpauth_uri, qr_svg}> for the client to render
//   verify2FA  → Result<{recovery_codes: string[]}> to show once
//   disable2FA → Result; the settings UI refreshes in place on success

async function bearerAndSub(): Promise<{ access: string; sub: string }> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!access) {
    redirect("/login");
  }
  // Own cookie, already validated by middleware — decode (no verify) for sub.
  const sub = decodeJwt(access).sub as string;
  return { access, sub };
}

export async function enroll2FA(): Promise<
  Result<{ secret: string; otpauth_uri: string; qr_svg: string }>
> {
  const { sub } = await bearerAndSub();
  const config = await getAuthConfig();
  const res = await request<{ secret: string; otpauth_uri: string }>(
    `${IDENTITY_URL}${config.totp_enroll_endpoint.replace("{user_id}", sub)}`,
    { service: "identity", method: "POST" },
  );
  if (!res.ok) return res;
  // Server-render the QR so the client doesn't need a QR lib in its bundle.
  // SVG keeps it crisp at any size and stays small (~2KB).
  const qr_svg = await QRCode.toString(res.data.otpauth_uri, {
    type: "svg",
    margin: 1,
    color: { dark: "#ffffff", light: "#00000000" },
  });
  return { ok: true, data: { ...res.data, qr_svg } };
}

export async function verify2FA(input: {
  secret: string;
  code: string;
}): Promise<Result<{ recovery_codes: string[] }>> {
  const { sub } = await bearerAndSub();
  const config = await getAuthConfig();
  return request<{ recovery_codes: string[] }>(
    `${IDENTITY_URL}${config.totp_verify_endpoint.replace("{user_id}", sub)}`,
    { service: "identity", method: "POST", body: input },
  );
}

export async function disable2FA(input: {
  password: string;
  code: string;
}): Promise<Result<unknown>> {
  const { sub } = await bearerAndSub();
  const config = await getAuthConfig();
  return request(
    `${IDENTITY_URL}${config.totp_disable_endpoint.replace("{user_id}", sub)}`,
    { service: "identity", method: "DELETE", body: input },
  );
}

// -- Set password (OAuth accounts) ---
//
// OAuth-registered users have no password. This lets them set one (once) so
// they can also log in with email + password. Identity rejects with 409 if a
// password already exists.

export type SetPasswordState = { error?: string; success?: boolean };

export async function setPassword(
  _prev: SetPasswordState,
  data: FormData,
): Promise<SetPasswordState> {
  const password = (data.get("password") as string | null) ?? "";
  const { access, sub } = await bearerAndSub();
  const config = await getAuthConfig();
  const res = await fetch(
    `${IDENTITY_URL}${config.set_password_endpoint.replace("{user_id}", sub)}`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ password }),
      cache: "no-store",
    },
  );
  if (res.status === 422) {
    const body = (await res.json().catch(() => ({}))) as {
      detail?: { msg?: string }[];
    };
    return { error: body.detail?.[0]?.msg ?? "Invalid password" };
  }
  if (res.status === 409) return { error: "Password already set" };
  if (!res.ok) {
    console.error(`[setPassword] identity ${res.status}: ${await res.text()}`);
    return { error: "Something went wrong, please try again" };
  }
  return { success: true };
}

// -- Set role (OAuth onboarding) ---
//
// A just-created Google account has no role. The user picks one once; identity
// returns a fresh token pair carrying the role claim, which we swap in before
// sending them to the dashboard.

export async function setRole(
  role: "client" | "insider",
): Promise<{ error: string } | void> {
  const { access, sub } = await bearerAndSub();
  const config = await getAuthConfig();
  const res = await fetch(
    `${IDENTITY_URL}${config.set_role_endpoint.replace("{user_id}", sub)}`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ role }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    console.error(`[setRole] identity ${res.status}: ${await res.text()}`);
    return { error: "Couldn't set role, please try again." };
  }
  await setAuthCookies((await res.json()) as TokenPair);
  redirect("/dashboard");
}

// -- API key management (dashboard) ---
//
// Public-API keys are minted here, in the logged-in user's settings, against
// the JWT-authed /api/v1/api-keys lifecycle. The key is shown once on create;
// only its prefix is retrievable afterwards. The key is then used to call the
// public API via the X-API-Key header.

const API_KEYS_ENDPOINT = "/api/v1/api-keys";

export type ApiKeyMeta = {
  id: string;
  name: string | null;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export async function listApiKeys(): Promise<Result<ApiKeyMeta[]>> {
  return request<ApiKeyMeta[]>(`${IDENTITY_URL}${API_KEYS_ENDPOINT}`, {
    service: "identity",
  });
}

export async function createApiKey(
  name?: string,
): Promise<Result<ApiKeyMeta & { key: string }>> {
  // On success the body includes the plaintext `key` — shown to the user once.
  return request<ApiKeyMeta & { key: string }>(`${IDENTITY_URL}${API_KEYS_ENDPOINT}`, {
    service: "identity",
    method: "POST",
    body: { name: name?.trim() || null },
  });
}

export async function revokeApiKey(keyId: string): Promise<Result<unknown>> {
  return request(`${IDENTITY_URL}${API_KEYS_ENDPOINT}/${keyId}`, {
    service: "identity",
    method: "DELETE",
  });
}

export async function logout() {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (access && refresh) {
    // Best-effort revoke; we always clear cookies locally even if identity is
    // unreachable. Logout targets the refresh token by its jti.
    try {
      const jti = decodeJwt(refresh).jti as string | undefined;
      if (jti) {
        const config = await getAuthConfig();
        await fetch(
          `${IDENTITY_URL}${config.revoke_endpoint.replace("{jti}", jti)}`,
          {
            method: "DELETE",
            headers: { authorization: `Bearer ${access}` },
            cache: "no-store",
          },
        ).catch(() => undefined);
      }
    } catch {
      // malformed refresh token — nothing to revoke, just clear locally
    }
  }
  await clearAuthCookies();
  redirect("/login");
}
