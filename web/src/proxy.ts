// proxy.ts — composed locale + auth middleware (Next.js 16 proxy convention).
//
// 1. next-intl negotiates the locale first. If it redirects (e.g. to add the
//    locale prefix / -> /en), short-circuit; the redirected request re-enters
//    the proxy and reaches the auth step.
// 2. For already-localized auth-protected paths, run the existing JWT gate.
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest, NextResponse as NextResponseType } from "next/server";
import type { JWTPayload } from "jose";

import { routing } from "@/i18n/routing";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  getAuthConfig,
  tryRefresh,
  verifyAccessToken,
} from "@/lib/auth-shared";

const intlMiddleware = createMiddleware(routing);

// Auth-protected path prefixes (after the locale segment is stripped).
const AUTH_PATHS = ["/dashboard", "/orders", "/matches", "/legend", "/settings", "/wallet"];

// Strip the leading /<locale> segment: /en/dashboard -> /dashboard
function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/[a-z]{2}(\/.*)?$/i);
  return m ? (m[1] ?? "/") : pathname;
}

function isAuthPath(pathname: string): boolean {
  const p = stripLocale(pathname);
  return AUTH_PATHS.some((auth) => p === auth || p.startsWith(auth + "/"));
}

// Locale from the pathname (e.g. /en/dashboard -> "en"), defaulting to en.
function localeFromPath(pathname: string): string {
  const m = pathname.match(/^\/([a-z]{2})\b/i);
  return m ? m[1] : routing.defaultLocale;
}

// Redirect to the localized login and clear both auth cookies. Used on every
// definitively dead-session path so the browser isn't left holding stale
// credentials that re-trigger a failing refresh on each navigation.
function toLogin(request: NextRequest) {
  const locale = localeFromPath(request.nextUrl.pathname);
  const res = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

function attachUserHeaders(response: NextResponseType, payload: JWTPayload): NextResponseType {
  response.headers.set("x-user-id", payload.sub as string);
  if (typeof payload.role === "string") {
    response.headers.set("x-user-role", payload.role);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  // 1. Locale negotiation first.
  const intlResponse = intlMiddleware(request);

  // If next-intl issued a redirect (e.g. adding the locale prefix), return it
  // immediately — the redirected request re-enters the proxy and reaches auth.
  if (
    intlResponse instanceof NextResponse &&
    intlResponse.status >= 300 &&
    intlResponse.status < 400
  ) {
    return intlResponse;
  }

  // 2. Auth gate only for protected pages (on already-localized paths).
  if (!isAuthPath(request.nextUrl.pathname)) {
    return intlResponse;
  }

  const locale = localeFromPath(request.nextUrl.pathname);
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!access && !refresh) {
    return toLogin(request);
  }

  if (access) {
    try {
      const payload = await verifyAccessToken(access);
      if (!payload.role) {
        return NextResponse.redirect(new URL(`/${locale}/onboarding/role`, request.url));
      }
      return attachUserHeaders(intlResponse, payload);
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
  const response = payload.role
    ? attachUserHeaders(intlResponse, payload)
    : NextResponse.redirect(new URL(`/${locale}/onboarding/role`, request.url));
  response.cookies.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
  response.cookies.set(
    REFRESH_COOKIE,
    pair.refresh_token,
    cookieOptions(config.refresh_ttl_seconds)
  );
  return response;
}

export const config = {
  // Match all pathnames except API, docs (Swagger proxy), _next, _vercel, and
  // files with dots. Auth logic is gated by isAuthPath() inside the proxy, so
  // non-protected pages (login, signup, onboarding) pass through after locale
  // negotiation.
  matcher: ["/((?!api|docs|trpc|_next|_vercel|.*\\..*).*)"],
};
