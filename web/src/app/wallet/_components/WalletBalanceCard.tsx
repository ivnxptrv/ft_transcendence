"use client";

import { useState, useRef } from "react";
import type { Transaction } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getBalance } from "@/actions/transactions";

export function WalletBalanceCard({
  initialBalance,
  initialTransactions,
  isClient,
}: {
  initialBalance: number;
  initialTransactions: Transaction[];
  isClient: boolean;
}) {
  // const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [modal, setModal] = useState<"topup" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");

  const balance = initialBalance;
  // setBalance(() => await getBalance());

  const topupBtn = `flex-1 py-4 rounded-full text-sm font-bold transition-all active:scale-95 cursor-pointer ${isClient ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black"}`;
  const withdrawBtn = `flex-1 py-4 rounded-full text-sm font-bold border transition-all active:scale-95 cursor-pointer ${isClient ? "bg-transparent border-white/10 text-white hover:bg-white/5" : "bg-transparent border-zinc-200 text-zinc-900 hover:bg-zinc-50"}`;
  const cardBg = isClient
    ? "bg-zinc-900/40 border-white/5 backdrop-blur-md"
    : "bg-white border-zinc-200/60";

  return (
    <>
      {/* Balance Card */}
      <section className={`rounded-3xl p-8 mb-12 shadow-xl border ${cardBg}`}>
        <div className="flex flex-col gap-1 mb-10">
          <span
            className={`text-[11px] font-bold uppercase tracking-widest ${isClient ? "text-zinc-500" : "text-zinc-400"}`}
          >
            Available Balance
          </span>
          <span className="text-5xl font-black tracking-tighter">฿{balance.toLocaleString()}</span>
        </div>

        {/* {modal ? (
          <div className="flex items-center gap-3 animate-in fade-in duration-200">
            <div className={`flex-1 flex items-center gap-2 rounded-full border px-5 py-3 ${isClient ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"}`}>
              <span className={`font-bold ${isClient ? "text-zinc-400" : "text-zinc-300"}`}>฿</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                autoFocus
                className={`bg-transparent text-base font-bold outline-none w-full ${isClient ? "text-white placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-300"}`}
              />
            </div>
            <button onClick={handleConfirm} className={topupBtn} style={{ flex: "0 0 auto", padding: "12px 20px" }}>
              Confirm
            </button>
            <button onClick={() => { setModal(null); setAmount(""); }} className={`text-[11px] font-bold uppercase tracking-widest cursor-pointer ${isClient ? "text-zinc-600 hover:text-white" : "text-zinc-400 hover:text-zinc-900"}`}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => setModal("topup")} className={topupBtn}>
              Top up
            </button>
            <button onClick={() => setModal("withdraw")} className={withdrawBtn}>
              Withdraw
            </button>
          </div>
        )} */}
      </section>

      {/* Transactions List */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2
            className={`text-xs font-bold uppercase tracking-widest ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
          >
            Recent Activity
          </h2>
        </div>
        <div
          className={`rounded-3xl border overflow-hidden divide-y ${isClient ? "bg-zinc-900/40 border-white/5 divide-white/5" : "bg-white border-zinc-200/60 divide-zinc-100"}`}
        >
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className={`flex items-center justify-between p-6 transition-colors ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
            >
              <div className="flex flex-col gap-1">
                <span
                  className={`text-sm font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}
                >
                  {txn.description}
                </span>
                <span
                  className={`text-[11px] font-medium ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  {formatDate(txn.date)}
                </span>
              </div>
              <span
                className={`text-base font-bold ${txn.amount > 0 ? "text-emerald-500" : isClient ? "text-zinc-400" : "text-zinc-900"}`}
              >
                {txn.amount > 0 ? "+" : ""}฿{Math.abs(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// function handleConfirm() {
//   const value = parseInt(amount, 10);
//   if (!value || value <= 0) return;

// if (modal === "topup") {
//   // TODO: POST /wallet/topup { amount } → creates transaction, returns updated balance
//   setBalance((b) => b + value);
//   setTransactions((t) => [
//     { id: `txn_${Date.now()}`, description: "Top up", amount: value, date: new Date() },
//     ...t,
//   ]);
// } else if (modal === "withdraw") {
//   if (value > balance) return;
//   // TODO: POST /wallet/withdraw { amount } → creates transaction, returns updated balance
//   setBalance((b) => b - value);
//   setTransactions((t) => [
//     { id: `txn_${Date.now()}`, description: "Withdrawal", amount: -value, date: new Date() },
//     ...t,
//   ]);
//   }
//   setAmount("");
//   setModal(null);
// }
