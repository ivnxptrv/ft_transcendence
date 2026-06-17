"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { login, type LoginState } from "@/actions/auth";
import { FieldInput, PrimaryButton, SecondaryButton } from "@/app/(auth)/_components/auth";

// Messages for the ?error= the Google callback redirects back with on failure.
const OAUTH_ERRORS: Record<string, string> = {
  oauth_unconfigured: "Google sign-in isn't configured.",
  oauth_cancelled: "Google sign-in was cancelled.",
  oauth_state: "Google sign-in expired, please try again.",
  oauth_failed: "Google sign-in failed, please try again.",
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );
  // Controlled so email/password survive the re-render when the OTP step
  // appears (and across a wrong-code retry).
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [oauthError, setOauthError] = useState<string | null>(null);

  // The Google callback redirects to /login?error=<code> on failure.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code && OAUTH_ERRORS[code]) setOauthError(OAUTH_ERRORS[code]);
  }, []);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white selection:bg-white selection:text-black font-sans relative overflow-hidden">
      {/* Dynamic Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-white/2 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-white/1 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-4xl p-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative z-10 animate-in fade-in duration-1000">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Vekko
          </h1>
          <p className="text-sm text-zinc-500">The first matching marketplace for insight</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <FieldInput
            name="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={setEmail}
            required
          />
          <FieldInput
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
            required
          />

          {state.totpRequired && (
            <FieldInput
              name="otp"
              type="text"
              placeholder="6-digit code or recovery code"
              autocomplete="one-time-code"
              value={otp}
              onChange={setOtp}
              required
            />
          )}

          {state.error && <p className="text-xs text-red-400">{state.error}</p>}

          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "…" : state.totpRequired ? "Verify code" : "Sign in"}
          </PrimaryButton>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-zinc-600">
              <span className="bg-transparent px-2">Or continue with</span>
            </div>
          </div>

          {oauthError && <p className="text-xs text-red-400">{oauthError}</p>}

          <SecondaryButton onClick={() => { window.location.href = "/api/auth/google/login"; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53"
              />
            </svg>
            Continue with Google
          </SecondaryButton>

          <p className="text-center text-xs text-zinc-500 mt-6">
            New here?{" "}
            <Link href="/signup" className="text-white hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
