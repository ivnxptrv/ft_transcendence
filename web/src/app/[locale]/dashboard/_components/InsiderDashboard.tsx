import type { Match, UserProfile } from "@/lib/types";
import type { Result } from "@/lib/errors";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import InsiderNav from "./InsiderNav";
import { LegendNudgeModalLazy } from "./LegendNudgeModalLazy";
import { MATCH_STATUS_LABEL, MATCH_STATUS_VARIANT } from "@/lib/matches";
import { SectionError } from "@/app/_components/SectionError";

export default function InsiderDashboard({
  matches,
  profile,
  hasLegend,
  page,
  pageSize,
  filters,
}: {
  matches: Result<{ matches: Match[]; total: number }>;
  profile: UserProfile;
  hasLegend: boolean;
  page: number;
  pageSize: number;
  filters: { status?: string };
}) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("status");
  const fullUserName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ");
  const totalPages = matches.ok
    ? Math.max(1, Math.ceil(matches.data.total / pageSize))
    : 1;
  // Pager links keep the active status filter so paging stays within it.
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    params.set("page", String(p));
    return `/dashboard?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      <InsiderNav hasLegend={hasLegend} />
      <LegendNudgeModalLazy hasLegend={hasLegend} userId={profile.id} />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-2">
            {t("insiderProfile")}
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">{fullUserName}</h1>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t("yourMatches")}
            </h2>
            {matches.ok && (
              <span className="text-[10px] text-zinc-400">
                {t("total", { count: matches.data.total })}
              </span>
            )}
          </div>

          {/* Status filter collapsed behind a button (native <details>, no JS).
              Opens automatically when a filter is active. */}
          <details open={Boolean(filters.status)} className="mb-6">
            <summary className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-zinc-300 text-[11px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              Filters{filters.status && <span className="text-zinc-900">•</span>}
            </summary>
            <form
              method="get"
              action="/dashboard"
              className="mt-3 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={filters.status ?? ""}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-[12px] text-zinc-700 outline-none focus:border-zinc-400 cursor-pointer"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                </select>
              </label>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-zinc-900 text-white text-[11px] font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Apply
                </button>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  Clear
                </Link>
              </div>
            </form>
          </details>

          {matches.ok ? (
            <div className="grid gap-3">
              {matches.data.matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="group bg-white border border-zinc-200/60 rounded-3xl p-6 hover:shadow-md hover:border-zinc-300 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6 mb-4">
                    <p className="text-base text-zinc-700 group-hover:text-black transition-colors leading-relaxed line-clamp-2">
                      {match.text}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap shrink-0 ${MATCH_STATUS_VARIANT[match.status]}`}
                    >
                      {tStatus(MATCH_STATUS_LABEL[match.status])}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-900">
                    {t("matchPercent", { percent: Math.round(match.score * 100) })}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <SectionError code={matches.error.code} op="interaction.matches" tone="light" />
          )}

          {matches.ok && totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between text-[11px] font-medium">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="px-4 py-2 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-300 cursor-not-allowed">
                  ← Prev
                </span>
              )}

              <span className="text-zinc-400">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="px-4 py-2 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-300 cursor-not-allowed">
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
