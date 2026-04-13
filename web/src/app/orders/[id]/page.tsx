import { getOrderById, getResponsesForOrder } from "@/lib/mock-data";
import type { ResponseCard } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";


function CredDots({ score }: { score: number }) {
  const filled = Math.round(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= filled ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-white/10"}`}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{score.toFixed(1)}</span>
    </div>
  );
}


function ResponseCardView({ card }: { card: ResponseCard }) {
  return (
    <div
      className={`relative group rounded-3xl p-6 border transition-all duration-300 ${
        card.isUnlocked 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-zinc-900/40 border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-6 mb-6">
        <p className={`text-sm leading-relaxed flex-1 ${card.isUnlocked ? "text-emerald-50" : "text-zinc-500 italic"}`}>
          "{card.insiderLegend}"
        </p>
        <div className="text-right">
          <span className="block text-lg font-black tracking-tighter text-white">฿{card.price}</span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Price</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <CredDots score={card.credibilityScore} />
        {card.isUnlocked ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Unlocked</span>
          </div>
        ) : (
          <button className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors active:scale-95 cursor-pointer">
            Unlock Response
          </button>
        )}
      </div>

      {card.isUnlocked && card.insiderInsight && (
        <div className="mt-6 pt-6 border-t border-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
          <p className="text-base text-emerald-200/90 leading-relaxed bg-emerald-500/[0.03] p-6 rounded-2xl border border-emerald-500/5 italic">
            {card.insiderInsight}
          </p>
        </div>
      )}
    </div>
  );
}


export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, responses] = await Promise.all([getOrderById(id), getResponsesForOrder(id)]);

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
          ← Back to Orders
        </Link>
        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Order Detail</span>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-12">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 mb-4">
            <h1 className="text-xl font-medium leading-relaxed text-zinc-100">
              {order.query}
            </h1>
          </div>
          <div className="flex items-center gap-3 px-2">
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
              Submitted {order.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              {order.responseCount} responses
            </span>
          </div>
        </header>

        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-700">Expert Responses</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid gap-4">
            {responses.map((card) => (
              <ResponseCardView key={card.id} card={card} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
