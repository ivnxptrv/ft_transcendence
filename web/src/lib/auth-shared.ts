// Edge-safe primitives shared between middleware (Edge runtime) and
// server actions / server components (Node runtime). MUST NOT import
// `next/headers` or any Node-only module — that would break the edge
// middleware bundle.

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

// -- Identity URL --

function identityUrl() {
  if (process.env.IDENTITY_URL && !process.env.IDENTITY_URL.includes("${")) {
    return process.env.IDENTITY_URL;
  }
  return `http://${process.env.IDENTITY_HOST ?? "localhost"}:${process.env.IDENTITY_PORT ?? "4010"}`;
}

export const IDENTITY_URL = identityUrl();

// -- Cookie contract ---

export const ACCESS_COOKIE = "jwt_access_token";
export const REFRESH_COOKIE = "jwt_refresh_token";

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

// -- Wire types --

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  // jti of the refresh token — used to revoke via DELETE /tokens/{jti}.
  jti: string;
};

// Identity's service-discovery document (/.well-known/auth-config). Endpoint
// templates carry `{user_id}` / `{jti}` placeholders the caller substitutes.
export type AuthConfig = {
  issuer: string;
  audience: string;
  refresh_ttl_seconds: number;
  register_endpoint: string;
  token_endpoint: string; // POST: password / refresh_token grants
  revoke_endpoint: string; // DELETE {jti}: logout
  oauth_google_endpoint: string; // POST: provision/link Google user → token pair
  user_endpoint: string; // GET {user_id}
  set_password_endpoint: string; // PUT {user_id}: set password on OAuth account
  totp_enroll_endpoint: string; // POST {user_id}
  totp_verify_endpoint: string; // POST {user_id}
  totp_disable_endpoint: string; // DELETE {user_id}
};

// -- Config + JWKS --

let _authConfigPromise: Promise<AuthConfig> | null = null;
export function getAuthConfig(): Promise<AuthConfig> {
  if (!_authConfigPromise) {
    _authConfigPromise = (async () => {
      const res = await fetch(`${IDENTITY_URL}/.well-known/auth-config`, {
        cache: "no-store",
      });
      if (!res.ok) {
        _authConfigPromise = null;
        throw new Error(`auth-config: identity returned ${res.status}`);
      }
      return (await res.json()) as AuthConfig;
    })();
  }
  return _authConfigPromise;
}

const JWKS = createRemoteJWKSet(new URL(`${IDENTITY_URL}/.well-known/jwks.json`));

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const config = await getAuthConfig();
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: config.issuer,
    audience: config.audience,
  });
  return payload;
}

// -- Refresh --

export async function tryRefresh(refresh: string): Promise<TokenPair | null> {
  try {
    const config = await getAuthConfig();
    const res = await fetch(`${IDENTITY_URL}${config.token_endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refresh }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TokenPair;
  } catch {
    return null;
  }
}
