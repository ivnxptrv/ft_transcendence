import { getOrderById, getInsightsForOrder } from "@/actions/orders";
import { InsightCardView } from "@/app/orders/_components/InsightCardView";
import { CompleteOrderButton } from "@/app/orders/_components/CompleteOrderButton";
import { SectionError } from "@/app/_components/SectionError";
import { getCurrentUser } from "@/lib/auth";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/orders";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user.role !== "client") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [order, insights] = await Promise.all([getOrderById(id), getInsightsForOrder(id)]);

  // A missing order is a real 404; other failures degrade in place.
  if (!order.ok && order.error.code === "NOT_FOUND") notFound();

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
        {!order.ok ? (
          <SectionError code={order.error.code} op="interaction.order" tone="dark" />
        ) : (
          <>
            <header className="mb-12">
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 mb-4">
                <div className="flex items-start justify-between gap-6">
                  <h1 className="text-xl font-semibold leading-relaxed text-white">
                    {order.data.title}
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap shrink-0 border border-white/5 ${STATUS_VARIANT[order.data.status]}`}
                  >
                    {STATUS_LABEL[order.data.status]}
                  </span>
                </div>
                <p className="mt-3 text-base font-medium leading-relaxed text-zinc-400">
                  {order.data.text}
                </p>
                <div className="mt-6 flex justify-end">
                  <CompleteOrderButton
                    orderId={order.data.id}
                    status={order.data.status}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                  Submitted{" "}
                  {new Date(order.data.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {insights.ok && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      {insights.data.length} insights
                    </span>
                  </>
                )}
              </div>
            </header>

            <section>
              <div className="flex items-center gap-3 mb-6 px-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-700">
                  Expert Insights
                </h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {insights.ok ? (
                <div className="grid gap-4">
                  {insights.data.map((card) => (
                    <InsightCardView key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <SectionError code={insights.error.code} op="interaction.insights" tone="dark" />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
