import { getMatchById } from "@/lib/mock-data";
import Link from "next/link";
import { notFound } from "next/navigation";


export default async function MatchReplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) notFound();

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      <nav className="sticky top-0 z-40 bg-[#FAF9F7]/80 backdrop-blur-md border-b border-zinc-200/60 px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard?role=insider" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
          ← Back to Matches
        </Link>
        <span className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">Craft Response</span>
        <div className="w-24" /> {/* Spacer */}
      </nav>

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-3 px-1">Target Order</p>
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

        <section className="flex flex-col gap-8">
          <div className="space-y-3">
            <div className="px-1">
              <h2 className="text-[10px] text-zinc-900 uppercase tracking-widest font-black">Your Insider Response</h2>
              <p className="text-xs text-zinc-400 mt-1">Write from actual experience. The client sees nothing until they pay.</p>
            </div>
            <textarea
              className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-base text-zinc-800 placeholder:text-zinc-300 leading-relaxed resize-none h-48 outline-none focus:border-zinc-400 transition-all font-sans"
              placeholder="What do you know about this that most people don't…"
            />
          </div>

          <div className="space-y-3">
             <h2 className="text-[10px] text-zinc-900 uppercase tracking-widest font-black px-1">Unlock Price</h2>
             <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 font-bold">฿</span>
                  <input
                    type="number"
                    defaultValue={150}
                    min={0}
                    step={10}
                    className="bg-transparent text-xl font-black text-zinc-900 w-20 outline-none"
                  />
                </div>
                <div className="h-4 w-px bg-zinc-100" />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">
                  THB · Set your value for this insight
                </span>
             </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-8">
            <button className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer">
              Skip Order
            </button>
            <button className="bg-zinc-900 text-white rounded-full px-10 py-4 text-sm font-bold hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-zinc-200">
              Submit Response
            </button>
          </div>

          <div className="bg-amber-100/50 border border-amber-200/50 rounded-2xl p-6">
            <p className="text-[11px] text-amber-900/70 leading-relaxed font-medium">
              When the client unlocks your response, ฿{match.insight?.price ?? 150} goes into your wallet. 
              You can withdraw your earnings at any time from Settings.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
