import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createRemoteJWKSet, jwtVerify } from "jose";

import type { Role } from "@/lib/types";

export type SessionUser = {
  userId: string;
  role: Role;
};

const IDENTITY_URL = process.env.IDENTITY_URL!;
const JWT_ISSUER = process.env.JWT_ISSUER ?? "identity";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "ft-transcendence";

// Fetched once and cached by jose; periodically refreshed in the background.
// Identity rotates keys via `kid`, so we never hardcode public material here.
const JWKS = createRemoteJWKSet(
  new URL(`${IDENTITY_URL}/api/v1/.well-known/jwks.json`),
);

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  return payload;
}

export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt_token");
  if (!token) {
    redirect("/login");
  }
  try {
    const payload = await verifyAccessToken(token.value);
    if (
      typeof payload.sub === "string" &&
      (payload.role === "client" || payload.role === "insider")
    ) {
      return {
        userId: payload.sub,
        role: payload.role,
      };
    }
  } catch {
    // fall through to redirect
  }
  redirect("/login");
}
