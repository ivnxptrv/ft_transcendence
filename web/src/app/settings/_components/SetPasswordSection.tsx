"use client";

import { useActionState } from "react";

import { setPassword, type SetPasswordState } from "@/actions/auth";

// Shown only for OAuth-registered accounts (no password yet). Lets the user set
// one so they can also sign in with email + password.
export function SetPasswordSection({ isClient }: { isClient: boolean }) {
  const [state, formAction, pending] = useActionState<SetPasswordState, FormData>(
    setPassword,
    {},
  );

  return (
    <>
      <p
        className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
      >
        Account access
      </p>
      <div
        className={`rounded-3xl border overflow-hidden mb-8 ${isClient ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200/60 shadow-sm"}`}
      >
        {state.success ? (
          // Password set: replace the form with a success notice. The button is
          // gone; on the next page load the section won't render at all
          // (has_password is now true).
          <p
            className={`p-5 text-[13px] font-semibold ${isClient ? "text-emerald-400" : "text-emerald-600"}`}
          >
            ✓ Password set. You can now log in with your email and password.
          </p>
        ) : (
          <form action={formAction} className="p-5 flex flex-col gap-3">
            <p
              className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}
            >
              Set a password
            </p>
            <p className={`text-xs ${isClient ? "text-zinc-400" : "text-zinc-600"}`}>
              You signed in with Google. Set a password to also log in with your
              email.
            </p>
            <input
              name="password"
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              required
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all font-sans ${isClient ? "bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20" : "bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400"}`}
            />
            {state.error && <p className="text-xs text-red-400">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full py-3 text-sm font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-1"
            >
              {pending ? "Saving…" : "Set password"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
