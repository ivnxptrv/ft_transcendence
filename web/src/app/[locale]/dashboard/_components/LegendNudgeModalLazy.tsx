"use client";

import dynamic from "next/dynamic";

// Client-only mount of LegendNudgeModal. `ssr: false` keeps the modal out of
// the server-rendered tree so its sessionStorage-backed lazy initializer never
// causes a hydration mismatch, and no effect-setState is needed to open it.
const LegendNudgeModal = dynamic(
  () => import("./LegendNudgeModal").then((m) => m.LegendNudgeModal),
  { ssr: false }
);

export function LegendNudgeModalLazy(props: { hasLegend: boolean; userId: string }) {
  return <LegendNudgeModal {...props} />;
}
