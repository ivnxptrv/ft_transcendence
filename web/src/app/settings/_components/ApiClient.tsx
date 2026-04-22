"use client";

import { useState } from "react";
import { SettingsGroup, SettingsRow } from "./SettingsGroup";

export function ExpertTools({ isClient }: { isClient: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopyApiKey() {
    // TODO: GET /api-keys → returns real key value to copy; for now copy the mock masked value
    navigator.clipboard.writeText("sk-mock-api-key-12345");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
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
    </>
  );
}
