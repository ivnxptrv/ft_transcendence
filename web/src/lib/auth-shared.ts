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
// Short-lived cookie holding the 2FA challenge JWT returned by /sessions when
// the user has 2FA enrolled. Read by /login/2fa to complete the exchange.
// httpOnly so it never reaches JS — only server actions read it.
export const CHALLENGE_COOKIE = "jwt_2fa_challenge";

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
};

// Returned by POST /sessions when the user has 2FA enabled. The caller must
// POST the challenge token + a TOTP/recovery code to /sessions/2fa to get a
// real TokenPair.
export type TwoFAChallenge = {
  twofa_required: true;
  challenge_token: string;
  expires_in: number;
};

export type LoginResponse = TokenPair | TwoFAChallenge;

export function isTwoFAChallenge(r: LoginResponse): r is TwoFAChallenge {
  return (r as TwoFAChallenge).twofa_required === true;
}

export type AuthConfig = {
  issuer: string;
  audience: string;
  refresh_ttl_seconds: number;
  register_endpoint: string;
  login_endpoint: string;
  // Optional fields below were added with the 2FA rollout. Treat as optional
  // so a stale identity build (no 2FA endpoints) doesn't blow up startup —
  // only the new flows that depend on them will fail.
  login_2fa_endpoint?: string;
  refresh_endpoint: string;
  logout_endpoint: string;
  me_endpoint: string;
  twofa_enroll_endpoint?: string;
  twofa_verify_endpoint?: string;
  twofa_disable_endpoint?: string;
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
    const res = await fetch(`${IDENTITY_URL}${config.refresh_endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TokenPair;
  } catch {
    return null;
  }
}
