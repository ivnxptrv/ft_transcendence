"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

function identityUrl() {
  if (process.env.IDENTITY_URL && !process.env.IDENTITY_URL.includes("${")) {
    return process.env.IDENTITY_URL;
  }

  return `http://${process.env.IDENTITY_HOST ?? "localhost"}:${process.env.IDENTITY_PORT ?? "4010"}`;
}

const IDENTITY_URL = identityUrl();

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

  // TODO: implement check with backend
  // const response = await fetch(`${process.env.IDENTITY_URL}/users/login`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     email,
  //     password,
  //   }),
  // });

  // if (!response.ok) {
  //   return await response.json();
  // }
  // const body = await response.json();
  // if (!body.id || (body.role !== "client" && body.role !== "insider")) {
  //   return { error: "Invalid login response" };
  // }
  const token = await generateJwtToken("user_123", "client");
  const cookieStore = await cookies();
  cookieStore.set("jwt_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
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

  // const response = await fetch(`${process.env.IDENTITY_URL}/users`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     email,
  //     password,
  //     firstName,
  //     lastName,
  //     role,
  //   }),
  // });

  // const response = await fetch(token);

  // if (!response.ok) {
  //   return await response.json();
  // }
  // const body = await response.json();
  // if (!body.id || (body.role !== "client" && body.role !== "insider")) {
  //   return { error: "Invalid signup response" };
  // }

  const token = await generateJwtToken("user_123", role);
  const cookieStore = await cookies();
  cookieStore.set("jwt_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("jwt_token");
  redirect("/login");
}
