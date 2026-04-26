import { getMatchById } from "@/lib/mock-data";
import { MatchInsightForm } from "@/app/matches/_components/MatchInsightForm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function MatchReplyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user.role !== "insider") {
    redirect("/dashboard");
  }

  const { id } = await params;
  // TODO: replace with GET /matches/:id — requires auth token; returns Match with optional Insight;
  // backend must verify this match is assigned to user.userId
  const match = await getMatchById(id);

  if (!match) notFound();

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      <nav className="sticky top-0 z-40 bg-[#FAF9F7]/80 backdrop-blur-md border-b border-zinc-200/60 px-6 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
        >
          ← Back to Matches
        </Link>
        <span className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">
          Craft Insight
        </span>
        <div className="w-24" />
      </nav>

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-3 px-1">
            Target Order
          </p>
          <div className="bg-zinc-200/40 border border-zinc-300/30 rounded-3xl p-8 relative overflow-hidden group">
            <p className="text-lg text-zinc-800 leading-relaxed font-medium relative z-10">
              {match.query}
            </p>
            <div className="mt-4 flex items-center gap-2 relative z-10">
              <span className="bg-white/80 backdrop-blur-sm text-[10px] font-bold text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 uppercase tracking-tight">
                {Math.round(match.matchScore * 100)}% Match Score
              </span>
            </div>
          </div>
        </header>

        <MatchInsightForm match={match} />
      </main>
    </div>
  );
}
