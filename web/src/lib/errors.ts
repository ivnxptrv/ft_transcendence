// Normalized, status-only error taxonomy shared by every downstream service,
// plus the single source of user-facing copy. Pure/isomorphic — no server-only
// imports, so client components can import the types and `messageFor`.

export type ErrorCode =
  | "UNAVAILABLE" // transport failure, timeout, 502/503/504 — service down/starting
  | "UNAUTHORIZED" // 401 — session invalid; escalates to re-auth
  | "FORBIDDEN" // 403 — authenticated but not allowed
  | "NOT_FOUND" // 404
  | "INVALID" // 400/422 — bad input
  | "CONFLICT" // 409 — state conflict (already exists, insufficient funds, …)
  | "RATE_LIMITED" // 429
  | "UNEXPECTED"; // 500 and anything unclassified

// `status`/`service`/`detail` are diagnostics for logs only — never shown to users.
export type ApiError = {
  code: ErrorCode;
  status?: number;
  service?: string;
  detail?: string;
};

// Every downstream call returns this. Expected errors are values, not throws.
// `headers` carries the upstream response headers (e.g. X-Total-Count for
// pagination); optional so existing callers that ignore it are unaffected.
export type Result<T> =
  | { ok: true; data: T; headers?: Headers }
  | { ok: false; error: ApiError };

// Operation scope for message overrides — "<service>.<concern>".
export type Operation =
  | "ledger.balance"
  | "ledger.transactions"
  | "ledger.purchase"
  | "ledger.claim"
  | "interaction.matches"
  | "interaction.match"
  | "interaction.orders"
  | "interaction.order"
  | "interaction.insights"
  | "semantic.legend"
  | "identity.profile"
  | "identity.setPassword"
  | "identity.setRole"
  | "identity.2fa"
  | "identity.apiKeys"
  | "identity.admin";

// Status-only normalization (decided: no service emits a machine-code envelope).
export function codeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 400:
    case 422:
      return "INVALID";
    case 429:
      return "RATE_LIMITED";
    case 502:
    case 503:
    case 504:
      return "UNAVAILABLE";
    default:
      return "UNEXPECTED";
  }
}

// Generic copy per code. Kept calm and non-technical.
// Values are translation keys (rendered via `t()` in the consuming component
// with the `errors` namespace) — not English strings.
const MESSAGES: Record<ErrorCode, string> = {
  UNAVAILABLE: "unavailable",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "notFound",
  INVALID: "invalid",
  CONFLICT: "conflict",
  RATE_LIMITED: "rateLimited",
  UNEXPECTED: "unexpected",
};

// Per-operation overrides — only where the generic line is wrong or too vague.
// Values are keys within the `errors` namespace.
const OVERRIDES: Partial<Record<Operation, Partial<Record<ErrorCode, string>>>> = {
  "ledger.balance": { UNAVAILABLE: "ledgerBalance" },
  "ledger.transactions": {
    UNAVAILABLE: "ledgerTransactions",
  },
  "ledger.purchase": {
    CONFLICT: "ledgerPurchaseConflict",
    UNAVAILABLE: "ledgerPurchaseUnavailable",
  },
  "ledger.claim": {
    UNAVAILABLE: "ledgerClaim",
  },
  "interaction.matches": { UNAVAILABLE: "interactionMatches" },
  "interaction.orders": { UNAVAILABLE: "interactionOrders" },
  "interaction.insights": { UNAVAILABLE: "interactionInsights" },
  "semantic.legend": {
    UNAVAILABLE: "semanticLegendUnavailable",
    CONFLICT: "semanticLegendConflict",
  },
  "identity.profile": { UNAVAILABLE: "identityProfile" },
  "identity.setPassword": { CONFLICT: "identitySetPassword" },
  "identity.2fa": { INVALID: "identity2fa" },
  "identity.apiKeys": { UNAVAILABLE: "identityApiKeys" },
  "identity.admin": {
    UNAVAILABLE: "identityAdminUnavailable",
    FORBIDDEN: "identityAdminForbidden",
    CONFLICT: "identityAdminConflict",
  },
};

// Single lookup: per-operation override, else the generic message.
// Returns a key within the `errors` namespace — callers translate via
// `useTranslations("errors")` (client) or `getTranslations("errors")` (server).
export function messageFor(op: Operation | undefined, code: ErrorCode): string {
  return (op && OVERRIDES[op]?.[code]) ?? MESSAGES[code];
}
