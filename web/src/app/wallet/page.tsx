import { getMockRole } from "@/lib/mock-role";
import { getTransactions } from "@/lib/mock-data";
import { WalletBalanceCard } from "@/app/wallet/_components/WalletBalanceCard";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

// TODO: replace MOCK_BALANCE with GET /wallet → { balance: number }
const MOCK_BALANCE = 1200;

export default async function WalletPage() {
  // TODO: replace with GET /wallet/transactions — requires auth token
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

        <WalletBalanceCard
          initialBalance={MOCK_BALANCE}
          initialTransactions={transactions}
          isClient={isClient}
        />
      </main>
    </div>
  );
}
