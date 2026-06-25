import type { Match, UserProfile } from "@/lib/types";
import type { Result } from "@/lib/errors";
import Link from "next/link";
import InsiderNav from "./InsiderNav";
import { LegendNudgeModalLazy } from "./LegendNudgeModalLazy";
import { MATCH_STATUS_LABEL, MATCH_STATUS_VARIANT } from "@/lib/matches";
import { SectionError } from "@/app/_components/SectionError";

export default function InsiderDashboard({
  matches,
  profile,
  hasLegend,
}: {
  matches: Result<Match[]>;
  profile: UserProfile;
  hasLegend: boolean;
}) {
  const fullUserName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      <InsiderNav hasLegend={hasLegend} />
      <LegendNudgeModalLazy hasLegend={hasLegend} userId={profile.id} />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-2">
            Insider Profile
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">{fullUserName}</h1>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Your Matches
            </h2>
            {matches.ok && (
              <span className="text-[10px] text-zinc-400">{matches.data.length} total</span>
            )}
          </div>

          {matches.ok ? (
            <div className="grid gap-3">
              {matches.data.map((match) => (
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
                      {MATCH_STATUS_LABEL[match.status]}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-900">
                    {Math.round(match.score * 100)}% match
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <SectionError code={matches.error.code} op="interaction.matches" tone="light" />
          )}
        </section>
      </main>
    </div>
  );
}
