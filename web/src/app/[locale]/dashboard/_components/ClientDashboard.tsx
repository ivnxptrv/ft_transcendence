import type { Order } from "@/lib/types";
import type { Result } from "@/lib/errors";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/orders";
import { Link } from "@/i18n/navigation";
import ClientNav from "./ClientNav";
import NewOrderButton from "./NewOrderButton";
import { SectionError } from "@/app/_components/SectionError";

export default function ClientDashboard({
  orders,
  userName,
  page,
  pageSize,
  filters,
}: {
  orders: Result<{ orders: Order[]; total: number }>;
  userName: string;
  page: number;
  pageSize: number;
  filters: { status?: string; dateFrom?: string; dateTo?: string };
}) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("status");
  const totalPages = orders.ok ? Math.max(1, Math.ceil(orders.data.total / pageSize)) : 1;
  // Pager links carry the active filters forward so paging stays within the
  // filtered result set.
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters.dateTo) params.set("date_to", filters.dateTo);
    params.set("page", String(p));
    return `/dashboard?${params.toString()}`;
  };
  const fieldCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-white/20 [color-scheme:dark]";
  const labelCls =
    "text-[10px] uppercase tracking-wider text-zinc-500 font-bold";
  const hasActiveFilters = Boolean(
    filters.status || filters.dateFrom || filters.dateTo,
  );
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <ClientNav />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-2">
              {t("clientProfile")}
            </p>
            <h1 className="text-4xl font-bold bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              {userName}
            </h1>
          </div>
          <NewOrderButton />
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              {t("yourOrders")}
            </h2>
            {orders.ok && (
              <span className="text-[10px] text-zinc-700">
                {t("total", { count: orders.data.total })}
              </span>
            )}
          </div>

          {/* Filters collapsed behind a button (native <details>, no JS). Opens
              automatically when a filter is already active. The GET form submits
              to the page so the server refetches (resets to page 1). */}
          <details open={hasActiveFilters} className="mb-6">
            <summary className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 text-[11px] font-bold text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              Filters{hasActiveFilters && <span className="text-white">•</span>}
            </summary>
            <form
              method="get"
              action="/dashboard"
              className="mt-3 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-4"
            >
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Status</span>
                <select
                  name="status"
                  defaultValue={filters.status ?? ""}
                  className={`${fieldCls} cursor-pointer`}
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="has_responses">Has responses</option>
                  <option value="completed">Completed</option>
                </select>
              </label>

              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className={labelCls}>From</span>
                  <input
                    type="date"
                    name="date_from"
                    defaultValue={filters.dateFrom ?? ""}
                    className={fieldCls}
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className={labelCls}>To</span>
                  <input
                    type="date"
                    name="date_to"
                    defaultValue={filters.dateTo ?? ""}
                    className={fieldCls}
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-white text-black text-[11px] font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Apply
                </button>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-[11px] text-zinc-500 hover:text-white transition-colors"
                >
                  Clear
                </Link>
              </div>
            </form>
          </details>

          {orders.ok ? (
            <div className="grid gap-3">
              {orders.data.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6 mb-2">
                    <p className="text-base text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                      {order.title}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap shrink-0 border border-white/5 ${STATUS_VARIANT[order.status]}`}
                    >
                      {tStatus(STATUS_LABEL[order.status])}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                    {order.text}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-medium">
                    <span className="text-zinc-600">{formatDate(new Date(order.createdAt), true)}</span>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span>{t("insights", { count: order.insightCount ?? 0 })}</span>
                    </div>
                  </div>

                  {/* Subtle Hover Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-white/1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Link>
              ))}
            </div>
          ) : (
            <SectionError code={orders.error.code} op="interaction.orders" tone="dark" />
          )}

          {orders.ok && totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between text-[11px] font-medium">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-white/5 text-zinc-700 cursor-not-allowed">
                  ← Prev
                </span>
              )}

              <span className="text-zinc-500">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-white/5 text-zinc-700 cursor-not-allowed">
                  Next →
                </span>
              )}
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}
