import { getOrderById, getInsightsForOrder } from "@/lib/mock-data";
import { InsightCardView } from "@/app/orders/_components/InsightCardView";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user.role !== "client") {
    redirect("/dashboard");
  }

  const { id } = await params;
  // TODO: replace with GET /orders/:id — requires auth token in header;
  // backend must verify this order belongs to user.userId
  const [order, insights] = await Promise.all([getOrderById(id), getInsightsForOrder(id)]);

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          ← Back to Orders
        </Link>
        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
          Order Detail
        </span>
        <div className="w-20" />
      </nav>

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-12">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 mb-4">
            <h1 className="text-xl font-medium leading-relaxed text-zinc-100">{order.text}</h1>
          </div>
          <div className="flex items-center gap-3 px-2">
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
              Submitted{" "}
              {order.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              {order.insightCount} insights
            </span>
          </div>
        </header>

        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-700">
              Expert Insights
            </h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid gap-4">
            {insights.map((card) => (
              <InsightCardView key={card.id} card={card} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
