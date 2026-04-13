"use client";

import { useState } from "react";
import { MOCK_INSIDER_PROFILE } from "@/lib/mock-data";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";


const existingLegend = MOCK_INSIDER_PROFILE[0]?.legend ?? "";


export default function LegendPage() {
  const [legend, setLegend] = useState(existingLegend);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      <InsiderNav />
      
      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-2">Internal Branding</p>
          <h1 className="text-4xl font-bold text-zinc-900">Your Legend</h1>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            This is what clients see before buying. Write from experience — who you are and what you know.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold px-1">Biography & Credentials</label>
            <textarea
              value={legend}
              onChange={(e) => setLegend(e.target.value)}
              placeholder='e.g. "Freelance developer, 4 years in Bangkok after leaving corporate…"'
              className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-base text-zinc-800 placeholder:text-zinc-300 leading-relaxed resize-none h-64 outline-none focus:border-zinc-400 transition-all font-sans"
            />
          </div>

          <div className="mt-2">
            <button
              type="button"
              className="w-full bg-zinc-900 text-white rounded-full py-4 text-sm font-bold hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-zinc-200"
            >
              Save legend
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
