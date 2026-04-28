// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

const IDENTITY_URL = process.env.IDENTITY_URL!;
const JWT_ISSUER = process.env.JWT_ISSUER ?? "identity";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "ft-transcendence";

const JWKS = createRemoteJWKSet(
  new URL(`${IDENTITY_URL}/api/v1/.well-known/jwks.json`),
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("jwt_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

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
