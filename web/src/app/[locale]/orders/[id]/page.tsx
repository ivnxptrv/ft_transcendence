import { getOrderById, getInsightsForOrder } from "@/actions/orders";
import { InsightCardView } from "../_components/InsightCardView";
import { CompleteOrderButton } from "../_components/CompleteOrderButton";
import { SectionError } from "@/app/_components/SectionError";
import { getCurrentUser } from "@/lib/auth";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/orders";
import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

// Uses cookies (session) — can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orders");
  const tStatus = await getTranslations("status");

  const user = await getCurrentUser();
  if (user.role !== "client") {
    redirect(`/${locale}/dashboard`);
  }

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
          {t("backToOrders")}
        </Link>
        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
          {t("orderDetail")}
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
                  <h1 className="text-xl font-semibold leading-relaxed text-white min-w-0 break-words">
                    {order.data.title}
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap shrink-0 border border-white/5 ${STATUS_VARIANT[order.data.status]}`}
                  >
                    {tStatus(STATUS_LABEL[order.data.status])}
                  </span>
                </div>
                <p className="mt-3 text-base font-medium leading-relaxed text-zinc-400 break-words">
                  {order.data.text}
                </p>
                <div className="mt-6 flex justify-end">
                  <CompleteOrderButton orderId={order.data.id} status={order.data.status} />
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                  {t("submitted")}{" "}
                  {new Date(order.data.createdAt).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {insights.ok && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      {t("insightsCount", { count: insights.data.length })}
                    </span>
                  </>
                )}
              </div>
            </header>

            <section>
              <div className="flex items-center gap-3 mb-6 px-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-700">
                  {t("expertInsights")}
                </h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {insights.ok ? (
                <div className="grid grid-cols-1 gap-4">
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
