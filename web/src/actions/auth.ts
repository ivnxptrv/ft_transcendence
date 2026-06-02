"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";

import {
  ACCESS_COOKIE,
  CHALLENGE_COOKIE,
  IDENTITY_URL,
  REFRESH_COOKIE,
  getAuthConfig,
  isTwoFAChallenge,
  type LoginResponse,
  type TokenPair,
} from "@/lib/auth-shared";

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

async function setChallengeCookie(challengeToken: string, expiresIn: number) {
  const cookieStore = await cookies();
  cookieStore.set(CHALLENGE_COOKIE, challengeToken, {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresIn,
  });
}

async function clearChallengeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CHALLENGE_COOKIE);
}

export async function login(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  const config = await getAuthConfig();
  const res = await fetch(`${IDENTITY_URL}${config.login_endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[login] identity ${res.status}: ${body}`);
    redirect("/login?error=1");
  }
  const body: LoginResponse = await res.json();
  if (isTwoFAChallenge(body)) {
    // Password OK but 2FA enrolled: stash the short-lived challenge token in
    // an httpOnly cookie and hand off to /login/2fa for the code step.
    await setChallengeCookie(body.challenge_token, body.expires_in);
    redirect("/login/2fa");
  }
  await setAuthCookies(body);
  redirect("/dashboard");
}

export async function loginTwoFA(data: FormData) {
  const code = data.get("code") as string;
  const cookieStore = await cookies();
  const challenge = cookieStore.get(CHALLENGE_COOKIE)?.value;
  if (!challenge) {
    // Challenge cookie expired or absent → start over from password.
    redirect("/login?error=1");
  }

  const config = await getAuthConfig();
  if (!config.login_2fa_endpoint) {
    console.error("[loginTwoFA] identity auth-config missing login_2fa_endpoint");
    redirect("/login?error=1");
  }
  const res = await fetch(`${IDENTITY_URL}${config.login_2fa_endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ challenge_token: challenge, code }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[loginTwoFA] identity ${res.status}: ${body}`);
    // Keep the challenge cookie so the user can retry with a fresh code,
    // unless identity says the challenge itself is no longer valid.
    if (res.status === 401 && body.includes("challenge")) {
      await clearChallengeCookie();
      redirect("/login?error=1");
    }
    redirect("/login/2fa?error=1");
  }
  const pair: TokenPair = await res.json();
  await clearChallengeCookie();
  await setAuthCookies(pair);
  redirect("/dashboard");
}

export async function signup(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const role = data.get("role") as string;
  if (role !== "client" && role !== "insider") {
    redirect("/signup");
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
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[signup] identity ${res.status}: ${body}`);
    redirect("/signup?error=1");
  }
  const pair: TokenPair = await res.json();
  await setAuthCookies(pair);
  redirect("/dashboard");
}

// -- 2FA management actions ---
//
// All three of these require a logged-in user. They forward the caller's
// bearer token to identity. Return shapes:
//   enroll2FA  → {secret, otpauth_uri} for the client to render
//   verify2FA  → {recovery_codes: string[]} to show once
//   disable2FA → void; redirects back to /settings on success

async function bearerOrRedirect(): Promise<string> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!access) {
    redirect("/login");
  }
  return access;
}

export async function enroll2FA(): Promise<{
  secret: string;
  otpauth_uri: string;
  qr_svg: string;
}> {
  const access = await bearerOrRedirect();
  const config = await getAuthConfig();
  if (!config.twofa_enroll_endpoint) {
    throw new Error("identity auth-config missing twofa_enroll_endpoint");
  }
  const res = await fetch(`${IDENTITY_URL}${config.twofa_enroll_endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${access}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[enroll2FA] identity ${res.status}: ${body}`);
    throw new Error(`enroll failed (${res.status})`);
  }
  const data = (await res.json()) as { secret: string; otpauth_uri: string };
  // Server-render the QR so the client doesn't need a QR lib in its bundle.
  // SVG keeps it crisp at any size and stays small (~2KB).
  const qr_svg = await QRCode.toString(data.otpauth_uri, {
    type: "svg",
    margin: 1,
    color: { dark: "#ffffff", light: "#00000000" },
  });
  return { ...data, qr_svg };
}

export async function verify2FA(input: {
  secret: string;
  code: string;
}): Promise<{ recovery_codes: string[] }> {
  const access = await bearerOrRedirect();
  const config = await getAuthConfig();
  if (!config.twofa_verify_endpoint) {
    throw new Error("identity auth-config missing twofa_verify_endpoint");
  }
  const res = await fetch(`${IDENTITY_URL}${config.twofa_verify_endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${access}`,
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[verify2FA] identity ${res.status}: ${body}`);
    throw new Error(res.status === 400 ? "Invalid code" : `verify failed (${res.status})`);
  }
  return (await res.json()) as { recovery_codes: string[] };
}

export async function disable2FA(data: FormData) {
  const password = data.get("password") as string;
  const code = data.get("code") as string;
  const access = await bearerOrRedirect();
  const config = await getAuthConfig();
  if (!config.twofa_disable_endpoint) {
    console.error("[disable2FA] identity auth-config missing twofa_disable_endpoint");
    redirect("/settings?twofa_error=1");
  }
  const res = await fetch(`${IDENTITY_URL}${config.twofa_disable_endpoint}`, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${access}`,
    },
    body: JSON.stringify({ password, code }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[disable2FA] identity ${res.status}: ${body}`);
    redirect("/settings?twofa_error=1");
  }
  redirect("/settings?twofa=disabled");
}

export async function logout() {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (access && refresh) {
    // Best-effort revoke on the server; we always clear cookies locally
    // even if identity is unreachable.
    const config = await getAuthConfig();
    await fetch(`${IDENTITY_URL}${config.logout_endpoint}`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  await clearAuthCookies();
  redirect("/login");
}
