"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard?role=insider", label: "Matches" },
  // { href: "/legend", label: "My profile" },
  { href: "/wallet", label: "Wallet" },
  { href: "/settings", label: "Settings" },
];

export default function InsiderNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-[#FAF9F7]/80 backdrop-blur-md border-b border-zinc-200/60 px-6 h-14 flex items-center justify-between font-sans">
      <span className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black">Vekko</span>
      <div className="flex items-center gap-1">
        {LINKS.map((link) => {
          // Note: for Matches, we check if pathname is /dashboard
          const isActive =
            pathname === link.href || (link.label === "Matches" && pathname === "/dashboard");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
