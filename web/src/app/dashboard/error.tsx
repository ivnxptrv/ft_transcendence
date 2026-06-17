"use client";

import { useEffect } from "react";

// Dashboard error boundary. Safety net for any throw during the server render
// (e.g. an unexpected downstream failure not handled in the action). Logs the
// real cause for diagnosis and offers a retry instead of a raw 500.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render failed:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-zinc-900 mb-2">
          Couldn&apos;t load your dashboard
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          A service was briefly unavailable. Try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:scale-[0.99] transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
