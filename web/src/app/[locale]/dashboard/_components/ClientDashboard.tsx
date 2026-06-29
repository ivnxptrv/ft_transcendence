import type { Order } from "@/lib/types";
import type { Result } from "@/lib/errors";
import { useLocale, useTranslations } from "next-intl";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/orders";
import { LocalDateTime } from "@/app/_components/LocalDateTime";
import { Dropdown } from "@/app/_components/Dropdown";
import { Select } from "@/app/_components/Select";
import { Link } from "@/i18n/navigation";
import ClientNav from "./ClientNav";
import NewOrderButton from "./NewOrderButton";
import { SectionError } from "@/app/_components/SectionError";
import { DatePicker } from "@/app/_components/DatePicker";

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
  filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    q?: string;
  };
}) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const totalPages = orders.ok ? Math.max(1, Math.ceil(orders.data.total / pageSize)) : 1;
  // All list state lives in the URL. buildHref makes a /dashboard link from the
  // given params, dropping empty ones — used for paging and the per-toggle
  // Clear links (each keeps the others' state, resetting only its own).
  const buildHref = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    const qs = sp.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };
  const allParams = {
    status: filters.status,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    sort: filters.sort,
    q: filters.q,
  };
  const pageHref = (p: number) => buildHref({ ...allParams, page: String(p) });
  // Date inputs keep [color-scheme:dark] so the native picker icon is themed.
  const fieldCls =
    "w-full bg-white/[0.06] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none transition-colors hover:border-white/20 focus:border-white/30 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer";
  // Status options reuse the shared STATUS_LABEL keys (same labels as the order
  // badges), plus an "all" sentinel; translated via the status namespace.
  const statusOptions = [
    { value: "", label: t("allStatuses") },
    ...Object.entries(STATUS_LABEL).map(([value, key]) => ({
      value,
      label: tStatus(key),
    })),
  ];
  const labelCls = "text-[10px] uppercase tracking-wider text-zinc-500 font-bold";
  const summaryCls =
    "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 text-[11px] font-bold text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden";
  const panelCls =
    "absolute left-0 top-full z-20 mt-2 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur p-4 shadow-xl";
  // "active" = a non-default value is in effect; drives the toggle's • dot.
  const hasFilters = Boolean(filters.status || filters.dateFrom || filters.dateTo);
  const sortActive = Boolean(filters.sort && filters.sort !== "date_desc");
  const hasSearch = Boolean(filters.q);
  // Each toggle's Clear keeps the other two toggles' state, resetting only itself.
  const clearFiltersHref = buildHref({ sort: filters.sort, q: filters.q });
  const clearSortHref = buildHref({
    status: filters.status,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    q: filters.q,
  });
  const clearSearchHref = buildHref({
    status: filters.status,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    sort: filters.sort,
  });
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

          {/* Filter, Sort and Search are independent <details> toggles (Dropdown
              adds outside-click/Escape close), laid out as a toolbar row. Each
              GET form carries the others' current values via hidden fields so
              applying one preserves the rest; submitting resets to page 1. */}
          <div className="mb-6 flex flex-wrap items-start gap-2">
            <Dropdown
              summaryClassName={summaryCls}
              summary={
                <>
                  {t("filters.filter")}
                  <span className={hasFilters ? "text-emerald-500" : "text-zinc-600"}>•</span>
                </>
              }
            >
              <form method="get" action="/dashboard" className={`${panelCls} w-80`}>
                {/* Keep the active sort and search when applying a filter. */}
                <input type="hidden" name="sort" value={filters.sort ?? "date_desc"} />
                {filters.q && <input type="hidden" name="q" value={filters.q} />}
                <div className="flex flex-col gap-1.5">
                  <span className={labelCls}>{t("filters.status")}</span>
                  <Select
                    name="status"
                    defaultValue={filters.status ?? ""}
                    theme="dark"
                    options={statusOptions}
                  />
                </div>

                <div className="flex gap-3">
                  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className={labelCls}>{t("filters.from")}</span>
                    <DatePicker
                      name="date_from"
                      defaultValue={filters.dateFrom}
                      locale={locale}
                      clearLabel={t("filters.clear")}
                      className={fieldCls}
                    />
                  </label>
                  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className={labelCls}>{t("filters.to")}</span>
                    <DatePicker
                      name="date_to"
                      defaultValue={filters.dateTo}
                      locale={locale}
                      clearLabel={t("filters.clear")}
                      className={fieldCls}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-white text-black text-[11px] font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    {t("filters.apply")}
                  </button>
                  <Link
                    href={clearFiltersHref}
                    className="px-3 py-2 text-[11px] text-zinc-500 hover:text-white transition-colors"
                  >
                    {t("filters.clear")}
                  </Link>
                </div>
              </form>
            </Dropdown>

            <Dropdown
              summaryClassName={summaryCls}
              summary={
                <>
                  {t("filters.sort")}
                  <span className={sortActive ? "text-emerald-500" : "text-zinc-600"}>•</span>
                </>
              }
            >
              <form method="get" action="/dashboard" className={`${panelCls} w-56`}>
                {/* Keep the active filters and search when changing the sort. */}
                {filters.status && <input type="hidden" name="status" value={filters.status} />}
                {filters.dateFrom && (
                  <input type="hidden" name="date_from" value={filters.dateFrom} />
                )}
                {filters.dateTo && <input type="hidden" name="date_to" value={filters.dateTo} />}
                {filters.q && <input type="hidden" name="q" value={filters.q} />}
                <div className="flex flex-col gap-1.5">
                  <span className={labelCls}>{t("filters.sortBy")}</span>
                  <Select
                    name="sort"
                    defaultValue={filters.sort ?? "date_desc"}
                    theme="dark"
                    options={[
                      { value: "date_desc", label: t("filters.newestFirst") },
                      { value: "date_asc", label: t("filters.oldestFirst") },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-white text-black text-[11px] font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    {t("filters.apply")}
                  </button>
                  <Link
                    href={clearSortHref}
                    className="px-3 py-2 text-[11px] text-zinc-500 hover:text-white transition-colors"
                  >
                    {t("filters.clear")}
                  </Link>
                </div>
              </form>
            </Dropdown>

            <Dropdown
              summaryClassName={summaryCls}
              summary={
                <>
                  {t("filters.search")}
                  <span className={hasSearch ? "text-emerald-500" : "text-zinc-600"}>•</span>
                </>
              }
            >
              <form method="get" action="/dashboard" className={`${panelCls} w-72`}>
                {/* Keep the active filters and sort when searching. */}
                {filters.status && <input type="hidden" name="status" value={filters.status} />}
                {filters.dateFrom && (
                  <input type="hidden" name="date_from" value={filters.dateFrom} />
                )}
                {filters.dateTo && <input type="hidden" name="date_to" value={filters.dateTo} />}
                <input type="hidden" name="sort" value={filters.sort ?? "date_desc"} />
                <label htmlFor="client-search" className="flex flex-col gap-1.5">
                  <span className={labelCls}>{t("filters.search")}</span>
                  <input
                    id="client-search"
                    type="text"
                    name="q"
                    defaultValue={filters.q ?? ""}
                    placeholder={t("filters.searchPlaceholder")}
                    autoComplete="off"
                    className={`${fieldCls} placeholder:text-zinc-600`}
                  />
                </label>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-white text-black text-[11px] font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    {t("filters.apply")}
                  </button>
                  <Link
                    href={clearSearchHref}
                    className="px-3 py-2 text-[11px] text-zinc-500 hover:text-white transition-colors"
                  >
                    {t("filters.clear")}
                  </Link>
                </div>
              </form>
            </Dropdown>
          </div>

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
                    <LocalDateTime iso={order.createdAt} withTime className="text-zinc-600" />
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
                  {t("filters.prev")}
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-white/5 text-zinc-700 cursor-not-allowed">
                  {t("filters.prev")}
                </span>
              )}

              <span className="text-zinc-500">{t("filters.pageOf", { page, totalPages })}</span>

              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  {t("filters.next")}
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-white/5 text-zinc-700 cursor-not-allowed">
                  {t("filters.next")}
                </span>
              )}
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}
