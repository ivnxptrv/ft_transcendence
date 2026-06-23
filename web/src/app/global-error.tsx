"use client";

import { useEffect, useTransition } from "react";

// Last-resort boundary for errors in the root layout itself (replaces the whole
// document, so it must render <html>/<body>). Per-route error.tsx and in-place
// SectionError handle everything above this; this only catches the truly
// unexpected.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-zinc-500 mb-6">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => startTransition(() => reset())}
            disabled={pending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {pending && (
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {pending ? "Retrying…" : "Retry"}
          </button>
        </div>
      </body>
    </html>
  );
}
