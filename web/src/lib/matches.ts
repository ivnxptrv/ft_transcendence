import type { MatchStatus } from "@/lib/types";

// Insider match status presentation, the light-theme counterpart to the client
// order badge (see lib/orders.ts). Label and colour stay in sync across views.
export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  completed: "Completed",
};

export const MATCH_STATUS_VARIANT: Record<MatchStatus, string> = {
  pending: "bg-zinc-100 text-zinc-500",
  submitted: "bg-amber-500/10 text-amber-600",
  completed: "bg-emerald-500/10 text-emerald-600",
};
