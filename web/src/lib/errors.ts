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
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

// Operation scope for message overrides — "<service>.<concern>".
export type Operation =
  | "ledger.balance"
  | "ledger.transactions"
  | "ledger.purchase"
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
  | "identity.apiKeys";

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
const MESSAGES: Record<ErrorCode, string> = {
  UNAVAILABLE: "Something went wrong reaching this service. Please try again.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  INVALID: "Some details are invalid. Please check and try again.",
  CONFLICT: "That conflicts with the current state.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  UNEXPECTED: "Something went wrong. Please try again.",
};

// Per-operation overrides — only where the generic line is wrong or too vague.
const OVERRIDES: Partial<Record<Operation, Partial<Record<ErrorCode, string>>>> = {
  "ledger.balance": { UNAVAILABLE: "We couldn't load your balance right now." },
  "ledger.transactions": {
    UNAVAILABLE: "We couldn't load your transactions right now.",
  },
  "ledger.purchase": {
    CONFLICT: "Insufficient balance for this purchase.",
    UNAVAILABLE: "The payment service is unavailable. Please try again.",
  },
  "interaction.matches": { UNAVAILABLE: "We couldn't load your matches right now." },
  "interaction.orders": { UNAVAILABLE: "We couldn't load your orders right now." },
  "interaction.insights": { UNAVAILABLE: "We couldn't load insights right now." },
  "semantic.legend": { UNAVAILABLE: "We couldn't load your legend right now." },
  "identity.profile": { UNAVAILABLE: "We're having trouble loading your account." },
  "identity.setPassword": { CONFLICT: "You already have a password set." },
  "identity.2fa": { INVALID: "Invalid code. Please try again." },
  "identity.apiKeys": { UNAVAILABLE: "We couldn't reach the key service. Please try again." },
};

// Single lookup: per-operation override, else the generic message.
export function messageFor(op: Operation | undefined, code: ErrorCode): string {
  return (op && OVERRIDES[op]?.[code]) ?? MESSAGES[code];
}
