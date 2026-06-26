// Top-up / withdrawal bounds. MAX caps the per-transaction amount well under
// the ledger's Numeric(10,2) range so extreme inputs are rejected cleanly
// instead of overflowing the column; MIN enforces a sensible floor. Shared by
// the server actions (authoritative) and the wallet UI (immediate feedback).
// Withdrawal is additionally bounded by the available balance at submit time.
export const MIN_TOPUP = 1;
export const MAX_TOPUP = 5000;
export const MIN_WITHDRAW = 1;
export const MAX_WITHDRAW = 5000;
