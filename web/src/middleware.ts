// Next.js middleware. Verifies the access cookie via identity's
// JWKS, auto-refreshes when expired, forwards `x-user-*` to handlers.
// Shared primitives live in lib/auth-shared.ts so server actions and
// server components can reuse them without duplicating logic.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWTPayload } from "jose";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  getAuthConfig,
  tryRefresh,
  verifyAccessToken,
  type TokenPair,
} from "@/lib/auth-shared";

async function setRotatedCookies(response: NextResponse, pair: TokenPair) {
  const config = await getAuthConfig();
  response.cookies.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
  response.cookies.set(REFRESH_COOKIE, pair.refresh_token, cookieOptions(config.refresh_ttl_seconds));
}

function redirectToLogin(request: NextRequest, clear: boolean) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  if (clear) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }
  return response;
}

function withUserHeaders(request: NextRequest, payload: JWTPayload) {
  const headers = new Headers(request.headers);
  if (typeof payload.sub === "string") headers.set("x-user-id", payload.sub);
  if (typeof payload.role === "string") headers.set("x-user-role", payload.role);
  return NextResponse.next({ request: { headers } });
}

export async function middleware(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!access && !refresh) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (access) {
    try {
      const payload = await verifyAccessToken(access);
      return withUserHeaders(request, payload);
    } catch {
      // access expired/invalid — fall through to refresh
    }
  }

  if (!refresh) return redirectToLogin(request, true);
  const pair = await tryRefresh(refresh);
  if (!pair) return redirectToLogin(request, true);
  try {
    const payload = await verifyAccessToken(pair.access_token);
    const response = withUserHeaders(request, payload);
    await setRotatedCookies(response, pair);
    return response;
  } catch {
    return redirectToLogin(request, true);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/matches/:path*",
    "/settings/:path*",
    "/wallet/:path*",
  ],
};
