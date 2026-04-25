"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Match } from "@/lib/types";
import { submitMatchInsight } from "@/actions/matches";

export function MatchInsightForm({ match }: { match: Match }) {
  const [response, setResponse] = useState("");
  const [price, setPrice] = useState(match.insight?.price ?? 150);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  function handleSkip() {
    // TODO: POST /matches/:id/skip — marks match as skipped, removes from active list
    router.push("/dashboard");
  }

  function handleSubmit() {
    // TODO: POST /matches/:id/respond { text: response, price }
    // Returns: { insight: Insight, match: Match (status → "responded") }

    // should we send all insights entity data or just these fields?
    // submitMatchInsight(userId, match.id, text, price);

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-zinc-900">Insight submitted</p>
          <p className="text-sm text-zinc-400 mt-1">
            The client will be notified. You earn ฿{price} if they unlock it.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors cursor-pointer"
        >
          ← Back to Matches
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="space-y-3">
        <div className="px-1">
          <h2 className="text-[10px] text-zinc-900 uppercase tracking-widest font-black">
            Your Insight
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Write from actual experience. The client sees nothing until they pay.
          </p>
        </div>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-base text-zinc-800 placeholder:text-zinc-300 leading-relaxed resize-none h-48 outline-none focus:border-zinc-400 transition-all font-sans"
          placeholder="What do you know about this that most people don't…"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-[10px] text-zinc-900 uppercase tracking-widest font-black px-1">
          Unlock Price
        </h2>
        <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 font-bold">฿</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0}
              step={10}
              className="bg-transparent text-xl font-black text-zinc-900 w-20 outline-none"
            />
          </div>
          <div className="h-4 w-px bg-zinc-100" />
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">
            THB · Set your value for this insight
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-8">
        <button
          onClick={handleSkip}
          className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer"
        >
          Skip Order
        </button>
        <button
          onClick={handleSubmit}
          className="bg-zinc-900 text-white rounded-full px-10 py-4 text-sm font-bold hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-zinc-200"
        >
          Submit Insight
        </button>
      </div>

      <div className="bg-amber-100/50 border border-amber-200/50 rounded-2xl p-6">
        <p className="text-[11px] text-amber-900/70 leading-relaxed font-medium">
          When the client unlocks your insight, ฿{price} goes into your wallet. You can withdraw
          your earnings at any time from Settings.
        </p>
      </div>
    </section>
  );
}
