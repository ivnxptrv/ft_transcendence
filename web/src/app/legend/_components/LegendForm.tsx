"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setLegend } from "@/actions/legend";
import { messageFor } from "@/lib/errors";

// Create form, shown only when the insider has no legend yet. Create-once:
// after saving there's no edit path, so this never renders again.
export function LegendForm() {
  const [legend, setLegendValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await setLegend(legend.trim());
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(messageFor("semantic.legend", res.error.code));
      }
    });
  }

  const canSave = legend.trim().length > 0 && !pending;

  return (
    <section className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold px-1">
          Expertise
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
          Tip: Keep it concise but personal — it&apos;s set once and can&apos;t be edited later.
        </p>
      </div>
    </section>
  );
}
