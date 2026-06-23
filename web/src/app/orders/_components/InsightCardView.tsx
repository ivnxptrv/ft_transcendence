"use client";

import { useState } from "react";
import Link from "next/link";
import type { InsightCard } from "@/lib/types";
import { submitPurchase } from "@/actions/transactions";
import { messageFor } from "@/lib/errors";
import { Modal } from "@/app/_components/Modal";

export function InsightCardView({ card }: { card: InsightCard }) {
  const [isUnlocked, setIsUnlocked] = useState(card.isPaid);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  async function handleUnlock() {
    setError(null);
    setLoading(true);

    const res = await submitPurchase(card.id);
    if (res.ok) {
      setIsUnlocked(true);
    } else if (res.error.code === "CONFLICT") {
      setShowWalletModal(true);
    } else {
      setError(messageFor("ledger.purchase", res.error.code));
    }
    setLoading(false);
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
          "{card.legend}"
        </p>
        <div className="text-right">
          <span className="block text-lg font-black tracking-tighter text-white">
            ${card.price}
          </span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            Price
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center items-end-safe gap-2">
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
            disabled={loading}
            className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors active:scale-95 cursor-pointer"
          >
            Unlock Insight
          </button>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {isUnlocked && card.text && (
        <div className="mt-6 pt-6 border-t border-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
          <p className="text-base text-emerald-200/90 leading-relaxed bg-emerald-500/3 p-6 rounded-2xl border border-emerald-500/5 italic">
            {card.text}
          </p>
        </div>
      )}

      <Modal open={showWalletModal} onClose={() => setShowWalletModal(false)} className="max-w-md">
        <div className="bg-[#FAF9F7] rounded-3xl border border-black/10 p-8 shadow-2xl text-center">
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Insufficient balance</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            You don&apos;t have enough funds to unlock this insight. Top up your wallet to continue.
          </p>
          <Link
            href="/wallet"
            onClick={() => setShowWalletModal(false)}
            className="inline-block bg-zinc-900 text-white rounded-full px-6 py-3 text-sm font-bold hover:bg-zinc-800 transition-colors"
          >
            Go to Wallet
          </Link>
        </div>
      </Modal>
    </div>
  );
}
