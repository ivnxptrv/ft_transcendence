"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/legend", label: "Legend" },
  { href: "/dashboard", label: "Matches" },
  { href: "/wallet", label: "Wallet" },
  { href: "/settings", label: "Settings" },
];

// `hasLegend` drives the soft nudge: a red dot on "Legend" until the insider
// adds one. Defaults to true so pages that don't know the state show no dot.
export default function InsiderNav({ hasLegend = true }: { hasLegend?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-[#FAF9F7]/80 backdrop-blur-md border-b border-zinc-200/60 px-6 h-14 flex items-center justify-between font-sans">
      <span className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black">Vekko</span>
      <div className="flex items-center gap-1">
        {LINKS.map((link) => {
          // Note: for Matches, we check if pathname is /dashboard
          const isActive =
            pathname === link.href || (link.label === "Matches" && pathname === "/dashboard");
          const showDot = link.label === "Legend" && !hasLegend;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {link.label}
              {showDot && (
                <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#FAF9F7]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
