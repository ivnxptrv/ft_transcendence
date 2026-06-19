"use client";

import { useState, useTransition } from "react";

import { claimBonus } from "@/actions/claim";
import { messageFor } from "@/lib/errors";
import type { Role } from "@/lib/types";

export function ClaimBonusButton({ role, isClient }: { role: Role; isClient: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClaim() {
    setError(null);
    startTransition(async () => {
      const res = await claimBonus();
      if (!res.ok) {
        setError(messageFor("ledger.claim", res.error.code));
      }
      // On success, revalidatePath in the action re-renders the page;
      // the button disappears because balance > 0.
    });
  }

  const amount = role === "client" ? "1000" : "100";

  return (
    <div className="flex flex-col items-center gap-4 mb-10">
      <p className={`text-sm ${isClient ? "text-zinc-400" : "text-zinc-600"}`}>
        Press to claim your welcome bonus
      </p>
      <p
        className={`text-[11px] font-bold uppercase tracking-widest ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
      >
        ${amount} for {role}s
      </p>
      <button
        type="button"
        onClick={handleClaim}
        disabled={pending}
        className="rounded-full px-8 py-3 text-sm font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
      >
        {pending ? "Claiming…" : "Claim bonus"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
