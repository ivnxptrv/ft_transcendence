import { getBalance, getTransactions } from "@/actions/transactions";
import { WalletBalanceCard } from "@/app/wallet/_components/WalletBalanceCard";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";
import { getCurrentUser } from "@/lib/auth";

export default async function WalletPage() {
  const balance = await getBalance();
  const transactions = await getTransactions();
  const { role } = await getCurrentUser();
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

        <WalletBalanceCard balance={balance} transactions={transactions} isClient={isClient} />
      </main>
    </div>
  );
}
