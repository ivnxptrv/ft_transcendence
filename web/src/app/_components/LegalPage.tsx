import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

// Shared shell for the Privacy Policy and Terms of Service pages. Light, legible
// reading layout (these pages are public — viewable signed-out). The body is
// rendered markdown, so styling targets the produced elements (h1/h2/p/ul/…)
// and the page bodies stay plain content files.
export function LegalPage({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-[12px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
        >
          ← Vekko
        </Link>
        <article className="mt-8 text-[14px] leading-relaxed text-zinc-700 [&_a]:underline [&_em]:text-zinc-500 [&_h1]:mb-1 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-zinc-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-zinc-900 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </article>
      </div>
    </main>
  );
}
