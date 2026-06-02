"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


const LINKS = [
  { href: "/dashboard", label: "Orders" },
  { href: "/wallet", label: "Wallet" },
  { href: "/settings", label: "Settings" },
];


export default function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 h-14 flex items-center justify-between font-sans">
      <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">
        Vekko
      </span>
      <div className="flex items-center gap-1">
        {LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 ${
                isActive 
                  ? "bg-white text-black" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
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
