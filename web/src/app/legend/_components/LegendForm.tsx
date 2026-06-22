"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setLegend } from "@/actions/legend";
import { messageFor } from "@/lib/errors";
import { Modal } from "@/app/_components/Modal";

// Create form, shown only when the insider has no legend yet. Create-once:
// after saving there's no edit path, so this never renders again.
export function LegendForm() {
  const [legend, setLegendValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await setLegend(legend.trim());
      if (res.ok) {
        // Confirm in place rather than redirecting — the success modal owns the
        // hand-off to matches. Dismissing it refreshes to the read-only view.
        setSaved(true);
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

      <Modal open={saved} onClose={() => router.refresh()} className="max-w-md">
        <div className="bg-[#FAF9F7] rounded-3xl border border-black/10 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-7 w-7 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">You&apos;re discoverable</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            Your legend is live. Clients can now find you, and matched orders will start
            showing up in your dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-block bg-zinc-900 text-white rounded-full px-6 py-3 text-sm font-bold hover:bg-zinc-800 transition-colors"
          >
            Check your matches
          </button>
        </div>
      </Modal>
    </section>
  );
}
