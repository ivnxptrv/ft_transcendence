"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setLegend } from "@/actions/legend";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

export default function LegendPage() {
  const [legend, setLegendValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await setLegend(legend.trim());
        router.push("/dashboard");
      } catch {
        setError("Couldn't save your legend. Please try again.");
      }
    });
  }

  const canSave = legend.trim().length > 0 && !pending;

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      {/* No legend yet — this page is where they add it, so the nudge dot shows. */}
      <InsiderNav hasLegend={false} />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-2">
            Internal Branding
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">Your Legend</h1>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            This is what clients see before buying. Write from experience — who you are and what you
            know. You won&apos;t appear in matches until you add it.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold px-1">
              Biography & Credentials
            </label>
            <textarea
              value={legend}
              onChange={(e) => setLegendValue(e.target.value)}
              placeholder='e.g. "Freelance developer, 4 years in Bangkok after leaving corporate…"'
              className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-base text-zinc-800 placeholder:text-zinc-300 leading-relaxed resize-none h-64 outline-none focus:border-zinc-400 transition-all font-sans"
            />
          </div>

          {error && <p className="text-xs text-red-500 px-1">{error}</p>}

          <div className="mt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="w-full rounded-full py-4 text-sm font-bold active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-zinc-200 bg-zinc-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? "Saving…" : "Save legend"}
            </button>
            <p className="text-[10px] text-zinc-400 text-center mt-6 uppercase tracking-widest font-bold">
              Tip: Keep it concise but personal.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
