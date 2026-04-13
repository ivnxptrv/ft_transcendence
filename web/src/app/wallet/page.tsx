import { getMockRole } from "@/lib/mock-role";
import { getTransactions } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

const MOCK_BALANCE = 1200;

export default async function WalletPage() {
  const transactions = await getTransactions();
  const role = await getMockRole();
  const isClient = role === "client";
  const Nav = isClient ? ClientNav : InsiderNav;

  return (
    <div
      className={`min-h-screen font-sans ${isClient ? "bg-black text-white" : "bg-[#FAF9F7] text-[#2A2520]"}`}
    >
      <Nav />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p
            className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
          >
            Financial Overview
          </p>
          <h1
            className={`text-4xl font-bold ${isClient ? "bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent" : "text-zinc-900"}`}
          >
            My Wallet
          </h1>
        </header>

        {/* Balance Card */}
        <section
          className={`rounded-3xl p-8 mb-12 shadow-xl border ${isClient ? "bg-zinc-900/40 border-white/5 backdrop-blur-md" : "bg-white border-zinc-200/60"}`}
        >
          <div className="flex flex-col gap-1 mb-10">
            <span
              className={`text-[11px] font-bold uppercase tracking-widest ${isClient ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Available Balance
            </span>
            <span className="text-5xl font-black tracking-tighter">
              ฿{MOCK_BALANCE.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`flex-1 py-4 rounded-full text-sm font-bold transition-all active:scale-95 cursor-pointer ${isClient ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black"}`}
            >
              Top up
            </button>
            <button
              className={`flex-1 py-4 rounded-full text-sm font-bold border transition-all active:scale-95 cursor-pointer ${isClient ? "bg-transparent border-white/10 text-white hover:bg-white/5" : "bg-transparent border-zinc-200 text-zinc-900 hover:bg-zinc-50"}`}
            >
              Withdraw
            </button>
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
      </main>
    </div>
  );
}
