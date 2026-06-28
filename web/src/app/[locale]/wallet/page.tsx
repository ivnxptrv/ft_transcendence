import { getBalance, getTransactions } from "@/actions/transactions";
import { WalletBalanceCard } from "./_components/WalletBalanceCard";
import AppNav from "@/app/[locale]/dashboard/_components/AppNav";
import { SectionError } from "@/app/_components/SectionError";
import { getSession } from "@/lib/session";
import { getTranslations, setRequestLocale } from "next-intl/server";

// Uses cookies (session) — can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function WalletPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wallet");

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
            {t("financialOverview")}
          </p>
          <h1
            className={`text-4xl font-bold ${isClient ? "bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent" : "text-zinc-900"}`}
          >
            {t("myWallet")}
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
