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
// Cookies are set on the returned response: a Route Handler does not persist
// cookies staged via next/headers `cookies()` onto a redirect it constructs.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  // Redirect to /login with an error code; also clears the state cookie.
  const loginError = (reason: string) => {
    const r = NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));
    r.cookies.delete(GOOGLE_STATE_COOKIE);
    return r;
  };

  const cfg = googleConfig();
  if (!cfg) return loginError("oauth_unconfigured");

  // Google returns ?error=access_denied when the user cancels.
  if (url.searchParams.get("error")) return loginError("oauth_cancelled");

  // Reading from the cookies() store is fine; only writes need the response.
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError("oauth_state");
  }

  let pair: TokenPair & { role_required?: boolean };
  let refreshTtl: number;
  try {
    const profile = await exchangeCode(cfg, code);
    const config = await getAuthConfig();
    refreshTtl = config.refresh_ttl_seconds;
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
    pair = (await res.json()) as TokenPair & { role_required?: boolean };
  } catch (err) {
    console.error("[google callback]", err);
    return loginError("oauth_failed");
  }

  // New accounts have no role yet → onboarding; everyone else → dashboard.
  const dest = pair.role_required ? "/onboarding/role" : "/dashboard";
  const response = NextResponse.redirect(new URL(dest, req.url));
  response.cookies.delete(GOOGLE_STATE_COOKIE); // single-use
  response.cookies.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
  response.cookies.set(REFRESH_COOKIE, pair.refresh_token, cookieOptions(refreshTtl));
  return response;
}
