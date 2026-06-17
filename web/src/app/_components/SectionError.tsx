"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { messageFor, type ErrorCode, type Operation } from "@/lib/errors";

// In-place fallback for a data region that failed to load. Keeps the page shell
// usable: shows the code-mapped message and a Retry that re-runs the server
// render. The retry runs inside a transition so `isPending` stays true for the
// whole refresh — the button shows a spinner instead of looking inert.
export function SectionError({
  code,
  op,
  tone = "light",
}: {
  code: ErrorCode;
  op?: Operation;
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const dark = tone === "dark";

  return (
    <div
      className={`rounded-3xl border p-6 text-center ${
        dark ? "bg-white/5 border-white/10" : "bg-white border-zinc-200/60"
      }`}
    >
      <p className={`text-sm mb-4 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
        {messageFor(op, code)}
      </p>
      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={pending}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
          dark
            ? "bg-white text-black hover:bg-zinc-200"
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {pending && (
          <span
            className={`w-3 h-3 rounded-full border-2 border-t-transparent animate-spin ${
              dark ? "border-zinc-900" : "border-white"
            }`}
          />
        )}
        {pending ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}
