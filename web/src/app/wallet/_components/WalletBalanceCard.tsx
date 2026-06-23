"use client";

import { useState, useTransition } from "react"; 
import type { Role, Transaction } from "@/lib/types";
import { formatDate } from "@/lib/utils";
// import { ClaimBonusButton } from "./ClaimBonusButton";
import { topupFunds, withdrawFunds } from "@/actions/transactions"; 

export function WalletBalanceCard({
  balance,
  transactions,
  isClient,
  role,
}: {
  balance: number;
  transactions: Transaction[];
  isClient: boolean;
  role: Role;
}) {
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [pending, startTransition] = useTransition(); 

  const cardBg = isClient
    ? "bg-zinc-900/40 border-white/5 backdrop-blur-md"
    : "bg-white border-zinc-200/60";

  const handleTopUp = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await topupFunds(parsedAmount);
      if (!res.ok) {
        const errorMessage = typeof res.error === 'object' && res.error !== null 
          ? (res.error as any).message || "Top up failed"
          : res.error || "Top up failed";
          
        setError(errorMessage);
      } else {
        setAmount("");
      }
    });
  };

  const handleWithdraw = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (parsedAmount > balance) {
      setError("Insufficient funds");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await withdrawFunds(parsedAmount);
      if (!res.ok) {
        const errorMessage = typeof res.error === 'object' && res.error !== null 
          ? (res.error as any).message || "Withdrawal failed"
          : res.error || "Withdrawal failed";

        setError(errorMessage);
      } else {
        setAmount("");
      }
    });
  };

  return (
    <>
      {/* Balance Card */}
      <section className={`rounded-3xl p-8 mb-12 shadow-xl border ${cardBg}`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isClient ? "text-zinc-500" : "text-zinc-400"}`}>
                Available Balance
              </span>
              <span className="text-5xl font-black tracking-tighter">
                ${balance.toLocaleString()}
              </span>
            </div>
            {/* {balance === 0 && <ClaimBonusButton role={role} isClient={isClient} />} */}
          </div>

          {/* Actions Row */}
          {balance >= 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-500/10">
              <div className="flex items-center justify-end gap-3">
                
                {/* 3. PLACE THE INPUT FIELD HERE (Right before the buttons) */}
                <div className="relative rounded-xl border border-zinc-500/20 bg-transparent px-3 py-1.5 focus-within:border-zinc-500/50 transition-colors">
                  <span className={`text-xs mr-1 ${isClient ? 'text-zinc-500' : 'text-zinc-400'}`}>$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={pending}
                    className="w-20 bg-transparent text-xs font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {role === "client" ? (
                  <button
                    type="button"
                    onClick={handleTopUp}
                    disabled={pending || !amount}
                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isClient ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {pending ? "Processing..." : "Top Up"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={pending || !amount} 
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {pending ? "Processing..." : "Withdraw"}
                  </button>
                )}
              </div>
              {/* Display errors if validation or backend fails */}
              {error && <p className="text-xs text-red-400 text-right mt-1">{error}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Transactions List */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${isClient ? "text-zinc-600" : "text-zinc-400"}`}>
            Recent Activity
          </h2>
        </div>
        <div className={`rounded-3xl border overflow-hidden divide-y ${isClient ? "bg-zinc-900/40 border-white/5 divide-white/5" : "bg-white border-zinc-200/60 divide-zinc-100"}`}>
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className={`flex items-center justify-between p-6 transition-colors ${isClient ? "hover:bg-white/5" : "hover:bg-zinc-50"}`}
            >
              <div className="flex flex-col gap-1">
                <span className={`text-[11px] font-medium ${isClient ? "text-zinc-600" : "text-zinc-400"}`}>
                  {formatDate(new Date(txn.createdAt))}
                </span>
              </div>
              <span className={`text-base font-bold ${txn.amount > 0 ? "text-emerald-500" : isClient ? "text-zinc-400" : "text-zinc-900"}`}>
                {txn.amount > 0 ? "+" : ""}${Math.abs(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}