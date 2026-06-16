import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_COOKIE,
  IDENTITY_URL,
  REFRESH_COOKIE,
  cookieOptions,
  getAuthConfig,
  type TokenPair,
} from "@/lib/auth-shared";
import {
  GOOGLE_STATE_COOKIE,
  exchangeCode,
  googleConfig,
} from "@/lib/oauth-google";

// GET /api/auth/google/callback?code=...&state=... — Google redirects here.
// Verifies the state cookie (CSRF), exchanges the code, sends the profile to
// identity for token minting, sets session cookies, redirects to /dashboard.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const loginError = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));

  const cfg = googleConfig();
  if (!cfg) return loginError("oauth_unconfigured");

  // Google returns ?error=access_denied when the user cancels.
  if (url.searchParams.get("error")) return loginError("oauth_cancelled");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_STATE_COOKIE); // single-use, regardless of outcome

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError("oauth_state");
  }

  try {
    const profile = await exchangeCode(cfg, code);
    const config = await getAuthConfig();
    const res = await fetch(`${IDENTITY_URL}${config.oauth_google_endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(profile),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[google callback] identity ${res.status}: ${await res.text()}`);
      return loginError("oauth_failed");
    }
    const pair = (await res.json()) as TokenPair;

    cookieStore.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
    cookieStore.set(
      REFRESH_COOKIE,
      pair.refresh_token,
      cookieOptions(config.refresh_ttl_seconds),
    );
  } catch (err) {
    console.error("[google callback]", err);
    return loginError("oauth_failed");
  }

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
