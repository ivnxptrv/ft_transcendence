import { getBalance, getTransactions } from "@/actions/transactions";
import { WalletBalanceCard } from "@/app/wallet/_components/WalletBalanceCard";
import AppNav from "@/app/dashboard/_components/AppNav";
import { SectionError } from "@/app/_components/SectionError";
import { getSession } from "@/lib/session";

export default async function WalletPage() {
  const { role, hasLegend } = await getSession();
  const isClient = role === "client";
  const [balance, transactions] = await Promise.all([getBalance(), getTransactions()]);

  return (
    <div
      className={`min-h-screen font-sans ${isClient ? "bg-black text-white" : "bg-[#FAF9F7] text-[#2A2520]"}`}
    >
      <AppNav role={role} hasLegend={hasLegend} />
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

        {/* Wallet data is all from ledger — one outage degrades the whole body. */}
        {balance.ok && transactions.ok ? (
          <WalletBalanceCard
            balance={balance.data.balance}
            transactions={transactions.data}
            isClient={isClient}
            role={role}
          />
        ) : (
          <SectionError
            code={
              !balance.ok
                ? balance.error.code
                : !transactions.ok
                  ? transactions.error.code
                  : "UNEXPECTED"
            }
            op="ledger.balance"
            tone={isClient ? "dark" : "light"}
          />
        )}
      </main>
    </div>
  );
}
