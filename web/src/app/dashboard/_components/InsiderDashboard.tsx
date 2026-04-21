import type { Match, MatchStatus, InsiderProfile } from "@/lib/types";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import InsiderNav from "./InsiderNav";

const STATUS_LABEL: Record<MatchStatus, string> = {
  new: "New",
  responded: "Sent",
  purchased: "Purchased",
  rated: "Rated",
};

const STATUS_VARIANT: Record<MatchStatus, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-200",
  responded: "bg-blue-100 text-blue-800 border-blue-200",
  purchased: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rated: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function InsiderDashboard({
  matches,
  profile,
}: {
  matches: Match[];
  profile: InsiderProfile;
}) {
  const newCount = matches.filter((m) => m.status === "new").length;

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      <InsiderNav />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-2">
            Expert Portfolio
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">Karn Srisuk</h1>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Matched Orders
            </h2>
            {newCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-tight">
                {newCount} new matches
              </span>
            )}
          </div>

          <div className="grid gap-3">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="group bg-white border border-zinc-200/60 rounded-3xl p-6 hover:shadow-md hover:border-zinc-300 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6 mb-4">
                  <p className="text-base text-zinc-700 group-hover:text-black transition-colors leading-relaxed line-clamp-2">
                    {match.query}
                  </p>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 whitespace-nowrap ${STATUS_VARIANT[match.status]}`}
                  >
                    {STATUS_LABEL[match.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-medium text-zinc-400">
                  <span className="text-zinc-900">{Math.round(match.matchScore * 100)}% match</span>
                  {match.insight?.price && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-zinc-200" />
                      <span>฿{match.insight.price}</span>
                    </>
                  )}
                  <span className="w-1 h-1 rounded-full bg-zinc-200" />
                  <span>{formatDate(match.receivedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
