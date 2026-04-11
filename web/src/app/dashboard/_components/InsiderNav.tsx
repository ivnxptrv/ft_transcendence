"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Matches" },
  { href: "/legend", label: "My profile" },
  { href: "/settings", label: "Settings" },
];

export default function InsiderNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{ background: "#faf9f7", borderBottom: "0.5px solid #e8e5e0" }}
      className="px-4 h-11 flex items-center justify-between"
    >
      <span
        style={{ fontSize: 11, color: "#b0a898", letterSpacing: "0.12em" }}
        className="font-medium uppercase"
      >
        Vekko
      </span>
      <div className="flex items-center gap-0.5">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 11,
              color: pathname === link.href ? "#3a3530" : "#aaa",
              background: pathname === link.href ? "#ede9e3" : "transparent",
            }}
            className="px-2.5 py-1 rounded-full"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
