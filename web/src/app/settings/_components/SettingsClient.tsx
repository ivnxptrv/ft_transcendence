"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

function SettingsRow({
  label,
  right,
  danger,
  isClient,
  onClick,
}: {
  label: string;
  right?: ReactNode;
  danger?: boolean;
  isClient: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 flex items-center justify-between transition-colors cursor-pointer group ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
    >
      <span
        className={`text-[13px] font-semibold ${danger ? "text-red-500" : isClient ? "text-zinc-200" : "text-zinc-900"}`}
      >
        {label}
      </span>
      {right && (
        <span
          className={`text-xs font-medium transition-colors ${isClient ? "text-zinc-600 group-hover:text-zinc-400" : "text-zinc-400 group-hover:text-zinc-600"}`}
        >
          {right}
        </span>
      )}
    </div>
  );
}

function SettingsGroup({ rows, isClient }: { rows: ReactNode[]; isClient: boolean }) {
  return (
    <div
      className={`rounded-3xl border overflow-hidden mb-8 ${isClient ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200/60 shadow-sm"}`}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className={
            i < rows.length - 1
              ? isClient
                ? "border-b border-white/5"
                : "border-b border-zinc-100"
              : ""
          }
        >
          {row}
        </div>
      ))}
    </div>
  );
}

export function SettingsClient({ isClient }: { isClient: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const Nav = isClient ? ClientNav : InsiderNav;

  function handleCopyApiKey() {
    // TODO: GET /api-keys → returns real key value to copy; for now copy the mock masked value
    navigator.clipboard.writeText("sk-mock-api-key-12345");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSignOut() {
    // TODO: POST /auth/logout → invalidates session/JWT on server before redirecting
    document.cookie = "user-role=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <div
      className={`min-h-screen font-sans ${isClient ? "bg-black text-white" : "bg-[#FAF9F7] text-[#2A2520]"}`}
    >
      <Nav />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          {/* <p
            className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
          >
            Preference Control
          </p> */}
          <h1
            className={`text-4xl font-bold ${isClient ? "bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent" : "text-zinc-900"}`}
          >
            Settings
          </h1>
        </header>

        <section>
          {/* <p className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}>
            Account Security
          </p>
          <SettingsGroup
            isClient={isClient}
            rows={[
              // TODO: onClick → open modal with email input; PATCH /profile/email { newEmail, currentPassword }
              <SettingsRow key="email" label="Change email" right="Edit ›" isClient={isClient} />,
              // TODO: onClick → open modal with password inputs; PATCH /profile/password { currentPassword, newPassword }
              <SettingsRow key="password" label="Change password" right="Edit ›" isClient={isClient} />,
            ]}
          /> */}

          <p
            className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
          >
            Expert Tools
          </p>
          <SettingsGroup
            isClient={isClient}
            rows={[
              <SettingsRow
                key="apikey"
                label="API keys & API secrets"
                onClick={handleCopyApiKey}
                right={
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] opacity-40">sk-••••••••</span>
                    <span
                      className={`text-[10px] underline underline-offset-4 font-bold border-l border-white/10 pl-3 ml-1 uppercase tracking-tighter ${copied ? "text-emerald-400" : ""}`}
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </span>
                  </div>
                }
                isClient={isClient}
              />,
              // TODO: href → link to real developer docs URL
              <SettingsRow
                key="docs"
                label="Developer Documentation"
                right="View docs ↗"
                isClient={isClient}
              />,
            ]}
          />

          <p
            className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
          >
            Session
          </p>
          <SettingsGroup
            isClient={isClient}
            rows={[
              <SettingsRow
                key="signout"
                label="Sign out of Vekko"
                danger
                onClick={handleSignOut}
                isClient={isClient}
              />,
            ]}
          />
        </section>
      </main>
    </div>
  );
}
