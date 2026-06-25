import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import type { UserProfile, SessionUser } from "@/lib/types";
import { ACCESS_COOKIE, IDENTITY_URL, getAuthConfig, verifyAccessToken } from "@/lib/auth-shared";
import { request } from "@/lib/api";

export { verifyAccessToken };

// Locale-aware login path. `getLocale()` reads the current request locale
// (set by setRequestLocale in the page/layout, or the middleware header as
// fallback). Called inline with redirect() so TypeScript's `never` narrowing
// still applies.
async function loginPath(): Promise<string> {
  const locale = await getLocale();
  return `/${locale}/login`;
}

export async function getUserProfile(): Promise<UserProfile> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE);
  if (!token) {
    redirect(await loginPath());
  }
  // There is no `me` alias: the user is addressed by their own sub, read from
  // the (already middleware-validated) access token.
  let sub: string;
  try {
    const payload = await verifyAccessToken(token.value);
    sub = payload.sub as string;
  } catch {
    redirect(await loginPath());
  }
  const config = await getAuthConfig();
  const res = await request<UserProfile>(
    `${IDENTITY_URL}${config.user_endpoint.replace("{user_id}", sub)}`,
    { service: "identity" }
  );
  if (!res.ok) {
    // A genuinely invalid session → re-auth. But identity being briefly
    // unreachable must not silently log the user out: throw to the root
    // boundary (retry) instead, since the authed shell needs the profile.
    if (res.error.code === "UNAUTHORIZED") redirect(await loginPath());
    throw new Error(`identity profile unavailable (${res.error.code})`);
  }
  return res.data;
}

export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE);
  if (!token) {
    redirect(await loginPath());
  }
  try {
    const payload = await verifyAccessToken(token.value);
    if (
      typeof payload.sub === "string" &&
      (payload.role === "client" || payload.role === "insider")
    ) {
      return {
        userId: payload.sub,
        role: payload.role,
      };
    }
  } catch (error) {
    console.error(error);
  }
  redirect(await loginPath());
}
