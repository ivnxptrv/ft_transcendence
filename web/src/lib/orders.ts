import type { OrderStatus } from "@/lib/types";

// Order status presentation, shared by the client list and order detail so the
// label/colour stay in sync across both views.
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  has_responses: "Answered",
  completed: "Completed",
};

export const STATUS_VARIANT: Record<OrderStatus, string> = {
  pending: "bg-white/5 text-zinc-500",
  has_responses: "bg-amber-500/10 text-amber-500",
  completed: "bg-emerald-500/10 text-emerald-500",
};
