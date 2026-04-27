import type { Transaction } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function WalletBalanceCard({
  balance,
  transactions,
  isClient,
}: {
  balance: number;
  transactions: Transaction[];
  isClient: boolean;
}) {
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
