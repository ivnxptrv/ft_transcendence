"use client";

import { useState } from "react";
import { completeOrder } from "@/actions/orders";
import { messageFor } from "@/lib/errors";
import type { OrderStatus } from "@/lib/types";

export function CompleteOrderButton({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "completed") {
    return (
      <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-[10px] font-black uppercase tracking-widest">
          Completed
        </span>
      </div>
    );
  }

  async function handleComplete() {
    setError(null);
    setLoading(true);
    const res = await completeOrder(orderId);
    if (!res.ok) {
      setError(messageFor("interaction.order", res.error.code));
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleComplete}
        disabled={loading}
        className="bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
      >
        {loading ? "Completing…" : "Mark Completed"}
      </button>
      <p className="text-[10px] text-zinc-600 max-w-[16rem] text-right">
        Closes this order to new expert matches.
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
