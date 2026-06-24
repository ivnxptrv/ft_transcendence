// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest, NextResponse as NextResponseType } from "next/server";
import type { JWTPayload } from "jose";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  getAuthConfig,
  tryRefresh,
  verifyAccessToken,
} from "@/lib/auth-shared";

// Redirect to login and clear both auth cookies. Used on every definitively
// dead-session path so the browser isn't left holding stale credentials that
// re-trigger a failing refresh on each navigation.
function toLogin(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  console.error(
    `[proxy] ${request.nextUrl.pathname} access=${access ? "present" : "MISSING"} refresh=${refresh ? "present" : "MISSING"}`,
  );

  if (!access && !refresh) {
    return toLogin(request);
  }

  if (access) {
    try {
      const payload = await verifyAccessToken(access);
      const gated = roleGate(request, payload);
      return gated ?? attachUserHeaders(NextResponse.next(), payload);
    } catch (e) {
      console.error("[proxy] access verify failed:", e);
      // Fall through to refresh attempt.
    }
  }

  if (!refresh) {
    return toLogin(request);
  }

  const pair = await tryRefresh(refresh);
  if (!pair) {
    console.error("[proxy] refresh failed (no pair)");
    return toLogin(request);
  }

  let payload: JWTPayload;
  try {
    payload = await verifyAccessToken(pair.access_token);
  } catch (e) {
    console.error("[proxy] refreshed-token verify failed:", e);
    return toLogin(request);
  }

  const config = await getAuthConfig();
  const response =
    roleGate(request, payload) ?? attachUserHeaders(NextResponse.next(), payload);
  response.cookies.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
  response.cookies.set(
    REFRESH_COOKIE,
    pair.refresh_token,
    cookieOptions(config.refresh_ttl_seconds)
  );
  return response;
}

// Role-based routing for an authenticated request. Returns a redirect when the
// role and path don't match, or null to allow the request through:
//   - no role yet            → onboarding (OAuth accounts pre-role-choice)
//   - admin off /admin       → /admin (the operator console is their only area)
//   - non-admin on /admin    → /dashboard (defense-in-depth; the page re-checks)
function roleGate(
  request: NextRequest,
  payload: JWTPayload,
): NextResponseType | null {
  const role = payload.role;
  if (!role) {
    return NextResponse.redirect(new URL("/onboarding/role", request.url));
  }
  const onAdminPath = request.nextUrl.pathname.startsWith("/admin");
  if (role === "admin" && !onAdminPath) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (role !== "admin" && onAdminPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return null;
}

function attachUserHeaders(response: NextResponseType, payload: JWTPayload): NextResponseType {
  response.headers.set("x-user-id", payload.sub as string);
  if (typeof payload.role === "string") {
    response.headers.set("x-user-role", payload.role);
  }
  return response;
}

/*
  Authenticated app pages. Server pages still call
  getCurrentUser() to read trusted user claims.
*/
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/matches/:path*",
    "/legend/:path*",
    "/settings/:path*",
    "/wallet/:path*",
    "/admin/:path*",
  ],
};
