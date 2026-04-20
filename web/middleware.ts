// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Use Text Encoder to prepare your secret key
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // This verifies the signature AND the expiration (exp)
    const { payload } = await jwtVerify(token, SECRET);

    // Optional: Pass user data to the page via headers
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub as string);
    return response;
  } catch (err) {
    // If the signature is wrong or token is expired, it throws
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
