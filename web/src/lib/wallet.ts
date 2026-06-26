// Top-up bounds. MAX caps the amount well under the ledger's Numeric(10,2)
// range so extreme inputs are rejected cleanly instead of overflowing the
// column; MIN enforces a sensible floor. Shared by the server action
// (authoritative) and the wallet UI (immediate feedback).
export const MIN_TOPUP = 1;
export const MAX_TOPUP = 5000;
