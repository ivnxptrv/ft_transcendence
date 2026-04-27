"use client";

import { useState } from "react";
import type { InsightCard } from "@/lib/types";

export function InsightCardView({ card }: { card: InsightCard }) {
  const [isUnlocked, setIsUnlocked] = useState(card.isUnlocked);

  function handleUnlock() {
    // TODO: POST /orders/:orderId/responses/:id/unlock
    // Body: {} | Response: { insiderInsight: string } — deducts card.price from wallet balance

    // submitPurchase();

    setIsUnlocked(true);
  }

  return (
    <div
      className={`relative group rounded-3xl p-6 border transition-all duration-300 ${
        isUnlocked
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-zinc-900/40 border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-6 mb-6">
        <p
          className={`text-sm leading-relaxed flex-1 ${isUnlocked ? "text-emerald-50" : "text-zinc-500 italic"}`}
        >
          "{card.insiderLegend}"
        </p>
        <div className="text-right">
          <span className="block text-lg font-black tracking-tighter text-white">
            ฿{card.price}
          </span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            Price
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end-safe">
        {/* <CredDots score={card.credibilityScore} /> */}
        {isUnlocked ? (
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
            <span className="text-[10px] font-black uppercase tracking-widest">Unlocked</span>
          </div>
        ) : (
          <button
            onClick={handleUnlock}
            className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors active:scale-95 cursor-pointer"
          >
            Unlock Insight
          </button>
        )}
      </div>

      {isUnlocked && card.insiderInsight && (
        <div className="mt-6 pt-6 border-t border-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
          <p className="text-base text-emerald-200/90 leading-relaxed bg-emerald-500/3 p-6 rounded-2xl border border-emerald-500/5 italic">
            {card.insiderInsight}
          </p>
        </div>
      )}
    </div>
  );
}
