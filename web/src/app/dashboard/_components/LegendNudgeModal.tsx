"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/app/_components/Modal";

// Shown once per login on the dashboard (the insider's landing) when they have
// no legend yet. The CTA links to the legend page so they can create it. Keyed
// in sessionStorage so it fires on first login only, not on every navigation
// back to the dashboard.
export function LegendNudgeModal({ hasLegend, userId }: { hasLegend: boolean; userId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasLegend) {
      const key = `legend_nudge:${userId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        setOpen(true);
      }
    }
  }, [hasLegend, userId]);

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="max-w-md">
      <div className="bg-[#FAF9F7] rounded-3xl border border-black/10 p-8 shadow-2xl text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">Become discoverable</h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
          To start receiving matched orders, write your legend. 
          You can still look around in the meantime.
        </p>
        <Link
          href="/legend"
          onClick={() => setOpen(false)}
          className="inline-block bg-zinc-900 text-white rounded-full px-6 py-3 text-sm font-bold hover:bg-zinc-800 transition-colors"
        >
          Create legend
        </Link>
      </div>
    </Modal>
  );
}
