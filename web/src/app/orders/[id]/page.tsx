import { getOrderById, getResponsesForOrder } from "@/lib/mock-data";
import { ResponseCardView } from "@/app/orders/_components/ResponseCardView";
import Link from "next/link";
import { notFound } from "next/navigation";


export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // TODO: replace with GET /orders/:id — requires auth token in header
  const [order, responses] = await Promise.all([getOrderById(id), getResponsesForOrder(id)]);

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
          ← Back to Orders
        </Link>
        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Order Detail</span>
        <div className="w-20" />
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
