"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const IDENTITY_URL = `http://${process.env.IDENTITY_HOST}:${process.env.IDENTITY_PORT}`;

const ACCESS_COOKIE = "jwt_token";
const REFRESH_COOKIE = "refresh_token";

type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

async function setAuthCookies(pair: TokenPair) {
  const cookieStore = await cookies();
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
  // Refresh TTL on identity is 14 days (REFRESH_TTL_DAYS) — mirror it here so
  // the cookie disappears at roughly the same time the server-side row expires.
  cookieStore.set(REFRESH_COOKIE, pair.refresh_token, {
    ...common,
    maxAge: 14 * 24 * 60 * 60,
  });
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function login(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  const res = await fetch(`${IDENTITY_URL}/api/v1/tokens/`, {
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
  const pair: TokenPair = await res.json();
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

  const res = await fetch(`${IDENTITY_URL}/api/v1/users/`, {
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

export async function logout() {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (access && refresh) {
    // Best-effort revoke on the server; we always clear cookies locally
    // even if identity is unreachable.
    await fetch(`${IDENTITY_URL}/api/v1/tokens/`, {
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
