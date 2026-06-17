"use client";

import { useState, useTransition } from "react";

import {
  createApiKey,
  revokeApiKey,
  type ApiKeyMeta,
} from "@/actions/auth";

// Where the public API docs are served (Swagger). In the deployed setup nginx
// proxies /docs to identity; override with NEXT_PUBLIC_API_DOCS_URL if needed.
const DOCS_URL = process.env.NEXT_PUBLIC_API_DOCS_URL ?? "/docs";

function maskedRow(prefix: string) {
  return `${prefix}${"•".repeat(8)}`;
}

export function ExpertTools({
  isClient,
  initialKeys,
}: {
  isClient: boolean;
  initialKeys: ApiKeyMeta[];
}) {
  const [keys, setKeys] = useState<ApiKeyMeta[]>(initialKeys);
  // The plaintext of a just-created key — shown once, then cleared.
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cardBg = isClient
    ? "bg-zinc-900/40 border-white/5"
    : "bg-white border-zinc-200/60 shadow-sm";
  const divider = isClient ? "border-white/5" : "border-zinc-100";

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createApiKey();
        setFreshKey(created.key);
        setCopied(false);
        // Drop the plaintext before storing in the list (metadata only).
        const { key: _key, ...meta } = created;
        void _key;
        setKeys((prev) => [meta, ...prev]);
      } catch {
        setError("Couldn't create a key. Try again.");
      }
    });
  }

  function handleRevoke(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        await revokeApiKey(id);
        setKeys((prev) => prev.filter((k) => k.id !== id));
      } catch {
        setError("Couldn't revoke that key.");
      }
    });
  }

  function copyFresh() {
    if (!freshKey) return;
    navigator.clipboard.writeText(freshKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const active = keys.filter((k) => !k.revoked_at);

  return (
    <>
      <p
        className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
      >
        Expert Tools
      </p>
      <div className={`rounded-3xl border overflow-hidden mb-8 ${cardBg}`}>
        {/* API keys */}
        <div className={`p-5 border-b ${divider} flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}
            >
              API keys
            </span>
            <button
              type="button"
              onClick={handleCreate}
              disabled={pending}
              className="text-[10px] uppercase tracking-tighter font-bold underline underline-offset-4 disabled:opacity-50 cursor-pointer"
            >
              {pending ? "…" : "New key"}
            </button>
          </div>

          <p className={`text-xs ${isClient ? "text-zinc-500" : "text-zinc-500"}`}>
            Use your key with the{" "}
            <code className="font-mono">X-API-Key</code> header to call the public
            API.
          </p>

          {/* One-time reveal of a freshly created key */}
          {freshKey && (
            <div
              className={`flex flex-col gap-2 p-3 rounded-xl ${isClient ? "bg-white/5" : "bg-zinc-100"}`}
            >
              <p
                className={`text-[10px] uppercase tracking-widest font-bold ${isClient ? "text-emerald-400" : "text-emerald-600"}`}
              >
                Copy now — shown only once
              </p>
              <div className="flex items-center gap-3">
                <code
                  className={`font-mono text-xs break-all ${isClient ? "text-zinc-200" : "text-zinc-800"}`}
                >
                  {freshKey}
                </code>
                <button
                  type="button"
                  onClick={copyFresh}
                  className={`shrink-0 text-[10px] uppercase tracking-tighter font-bold underline underline-offset-4 cursor-pointer ${copied ? "text-emerald-400" : ""}`}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Existing keys (metadata only) */}
          {active.length === 0 ? (
            <p className={`text-xs ${isClient ? "text-zinc-600" : "text-zinc-400"}`}>
              No keys yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {active.map((k) => (
                <li key={k.id} className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[11px] ${isClient ? "text-zinc-400" : "text-zinc-600"}`}
                  >
                    {maskedRow(k.prefix)}
                    {k.name ? (
                      <span className="opacity-50"> · {k.name}</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevoke(k.id)}
                    disabled={pending}
                    className="text-[10px] uppercase tracking-tighter font-bold text-red-500 underline underline-offset-4 disabled:opacity-50 cursor-pointer"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Developer docs */}
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-5 flex items-center justify-between transition-colors group ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
        >
          <span
            className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}
          >
            Developer Documentation
          </span>
          <span
            className={`text-xs font-medium ${isClient ? "text-zinc-600 group-hover:text-zinc-400" : "text-zinc-400 group-hover:text-zinc-600"}`}
          >
            View docs ↗
          </span>
        </a>
      </div>
    </>
  );
}
