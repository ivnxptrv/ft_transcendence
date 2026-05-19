// middleware.ts
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

export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!access && !refresh) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (access) {
    try {
      const payload = await verifyAccessToken(access);
      return attachUserHeaders(NextResponse.next(), payload);
    } catch {
      // Fall through to refresh attempt.
    }
  }

  if (!refresh) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const pair = await tryRefresh(refresh);
  if (!pair) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let payload: JWTPayload;
  try {
    payload = await verifyAccessToken(pair.access_token);
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const config = await getAuthConfig();
  const response = attachUserHeaders(NextResponse.next(), payload);
  response.cookies.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
  response.cookies.set(
    REFRESH_COOKIE,
    pair.refresh_token,
    cookieOptions(config.refresh_ttl_seconds),
  );
  return response;
}

function attachUserHeaders(
  response: NextResponseType,
  payload: JWTPayload,
): NextResponseType {
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
    "/settings/:path*",
    "/wallet/:path*",
  ],
};
