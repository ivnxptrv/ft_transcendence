// Thin pass-through for the public, X-API-Key-authed API.
//
// `web` is the only service exposed to the outside, so it is the public door
// for identity's key-authed gateway. These handlers forward the request to
// identity verbatim and never inspect or validate the key — identity stays the
// single source of truth for API keys and rate limiting. Only the X-API-Key
// header (and content-type) is forwarded; session cookies are deliberately not,
// so the public API can't be driven by a logged-in browser session.

import { NextRequest, NextResponse } from "next/server";
import { IDENTITY_URL } from "@/lib/auth-shared";

// Response headers worth surfacing to the public caller.
const PASS_THROUGH = ["content-type", "x-ratelimit-limit", "x-ratelimit-remaining", "retry-after"];

// Statuses that must not carry a body.
const NULL_BODY = new Set([204, 304]);

/**
 * Forward the current request to identity at the SAME path. Web and identity
 * share the public path space, so the pathname is reused as-is. The catch-all
 * under /api/v1/public/* blanket-proxies the whole prefix; that prefix is the
 * boundary — it can only reach identity's public router, never its internal
 * (Bearer-authed) surface, which lives outside /public.
 */
export async function forwardToIdentity(req: NextRequest): Promise<NextResponse> {
  const target = `${IDENTITY_URL}${req.nextUrl.pathname}${req.nextUrl.search}`;

  const headers = new Headers();
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) headers.set("x-api-key", apiKey);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, { method: req.method, headers, body, redirect: "manual" });
  } catch {
    return NextResponse.json(
      { code: "bad_gateway", message: "Upstream service unavailable" },
      { status: 502 }
    );
  }

  const payload = NULL_BODY.has(upstream.status) ? null : await upstream.text();
  const out = new NextResponse(payload, { status: upstream.status });
  for (const name of PASS_THROUGH) {
    const value = upstream.headers.get(name);
    if (value) out.headers.set(name, value);
  }
  return out;
}
