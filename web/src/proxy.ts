// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/auth-shared";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verifyAccessToken(token);

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub as string);
    if (typeof payload.role === "string") {
      response.headers.set("x-user-role", payload.role);
    }
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
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
