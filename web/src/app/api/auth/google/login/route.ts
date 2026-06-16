import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  GOOGLE_STATE_COOKIE,
  buildAuthorizeUrl,
  googleConfig,
} from "@/lib/oauth-google";

// GET /api/auth/google/login. Generates a CSRF `state`, stores it in a
// short-lived httpOnly cookie, and redirects to Google.
export async function GET(req: Request) {
  const cfg = googleConfig();
  if (!cfg) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_unconfigured", req.url),
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 min
  });

  return NextResponse.redirect(buildAuthorizeUrl(cfg, state));
}
