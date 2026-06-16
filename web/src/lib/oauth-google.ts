// Server-only Google OAuth helpers. Holds the client credentials and runs the
// authorization-code exchange; the client secret stays server-side.

import { decodeJwt } from "jose";

export const GOOGLE_STATE_COOKIE = "google_oauth_state";

export type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizeUrl: string;
  tokenUrl: string;
};

// All values from env. Returns null (not throws) when any are missing, so the
// login route can redirect with an error instead of 500-ing.
export function googleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const authorizeUrl = process.env.GOOGLE_AUTH_URL;
  const tokenUrl = process.env.GOOGLE_TOKEN_URL;
  if (!clientId || !clientSecret || !redirectUri || !authorizeUrl || !tokenUrl) {
    return null;
  }
  return { clientId, clientSecret, redirectUri, authorizeUrl, tokenUrl };
}

export function buildAuthorizeUrl(cfg: GoogleConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    // Force the account chooser instead of reusing an existing Google session.
    prompt: "select_account",
  });
  return `${cfg.authorizeUrl}?${params.toString()}`;
}

export type GoogleProfile = {
  google_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

// Exchange the code for tokens and read the profile from the id_token. No local
// signature check needed: the id_token comes directly from Google's token
// endpoint over TLS, authenticated by the client secret.
export async function exchangeCode(
  cfg: GoogleConfig,
  code: string,
): Promise<GoogleProfile> {
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`google token exchange failed (${res.status}): ${detail}`);
  }
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("google token response missing id_token");

  const claims = decodeJwt(id_token) as {
    sub?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
  };
  if (!claims.sub || !claims.email) {
    throw new Error("google id_token missing sub/email");
  }
  return {
    google_id: claims.sub,
    email: claims.email,
    first_name: claims.given_name ?? null,
    last_name: claims.family_name ?? null,
  };
}
