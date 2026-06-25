// The single gateway client. Every downstream call (identity/interaction/
// semantic/ledger) goes through `request`, which injects auth, enforces a
// timeout, retries once on a transient outage for safe reads, and normalizes
// every transport/HTTP failure into a typed Result. Server-only (reads cookies).

import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/lib/auth-shared";
import { codeFromStatus, type ApiError, type Result } from "@/lib/errors";

// Kept low so a hard-down service degrades quickly. With the single retry the
// worst case before the fallback shows is ~2× this.
const DEFAULT_TIMEOUT_MS = 4000;
// Writes can legitimately take longer than a read (a create may fan out to peer
// services), so they get a larger budget — aborting a write mid-flight risks
// reporting a failure for an operation the server actually completed.
const WRITE_TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 400;

export type RequestOptions = {
  // For logs/diagnostics — identifies the upstream in error lines.
  service: string;
  method?: string;
  body?: unknown;
  // Attach the caller's bearer token (default true).
  auth?: boolean;
  // Auto-retry once on UNAVAILABLE. Defaults to true for GET only — never retry
  // writes (no double-submit). Absorbs the cross-service startup race.
  retry?: boolean;
  timeoutMs?: number;
  // Sent as the `Idempotency-Key` header. A retried write carrying the same key
  // replays the original response instead of executing twice (server dedups).
  idempotencyKey?: string;
};

async function attempt<T>(
  url: string,
  opts: RequestOptions,
  bearer: string | undefined
): Promise<Result<T>> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  if (opts.idempotencyKey) headers["idempotency-key"] = opts.idempotencyKey;

  // Reads abort quickly; writes get the larger budget unless caller overrides.
  const timeoutMs = opts.timeoutMs ?? (method === "GET" ? DEFAULT_TIMEOUT_MS : WRITE_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      // Body is diagnostics only — kept out of user-facing copy.
      const detail = await res.text().catch(() => undefined);
      const error: ApiError = {
        code: codeFromStatus(res.status),
        status: res.status,
        service: opts.service,
        detail,
      };
      // Expected, handled failure — warn (not error) so Next's dev overlay
      // doesn't intercept the page. Plain string, no Error object.
      console.warn(`[api] ${opts.service} ${method} ${res.status} ${url}`);
      return { ok: false, error };
    }

    if (res.status === 204) return { ok: true, data: undefined as T };
    const text = await res.text();
    const data = (text ? JSON.parse(text) : undefined) as T;
    return { ok: true, data };
  } catch (e) {
    // Transport failure / timeout / abort — the service is unreachable. Expected
    // and handled, so warn with a plain string: passing the raw Error to
    // console.error would surface Next's dev overlay and block the page.
    console.warn(`[api] ${opts.service} ${method} unreachable ${url}: ${String(e)}`);
    return {
      ok: false,
      error: { code: "UNAVAILABLE", service: opts.service, detail: String(e) },
    };
  }
}

export async function request<T>(url: string, opts: RequestOptions): Promise<Result<T>> {
  const method = opts.method ?? "GET";
  const canRetry = opts.retry ?? method === "GET";

  let bearer: string | undefined;
  if (opts.auth ?? true) {
    bearer = (await cookies()).get(ACCESS_COOKIE)?.value;
  }

  let result = await attempt<T>(url, opts, bearer);
  if (!result.ok && result.error.code === "UNAVAILABLE" && canRetry) {
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    result = await attempt<T>(url, opts, bearer);
  }
  return result;
}
