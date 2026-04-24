"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/actions/auth";
import { FieldInput, PrimaryButton } from "@/app/(auth)/_components/auth";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  const [role, setRole] = useState<Role>("client");

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
            Create Account
          </h1>
          <p className="text-sm text-zinc-500">Join the marketplace for insight</p>
        </div>

        <form action={signup} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <FieldInput name="firstName" placeholder="First name" required />
            <FieldInput name="lastName" placeholder="Last name" required />
          </div>

          <FieldInput name="email" type="email" placeholder="your@email.com" required />
          <FieldInput name="password" type="password" placeholder="Password" required />

          <div className="mt-2">
            <p className="text-[11px] text-zinc-500 mb-3 uppercase tracking-widest font-bold">
              I am a…
            </p>
            {/* Hidden input to capture role in FormData */}
            <input type="hidden" name="role" value={role} />

            <div className="grid grid-cols-2 gap-3">
              {(["client", "insider"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all cursor-pointer ${
                    role === r
                      ? "bg-white/5 border-white text-white"
                      : "bg-transparent border-white/10 text-zinc-500 hover:border-white/20"
                  }`}
                >
                  <span className="text-sm font-bold uppercase tracking-wide">
                    {r === "client" ? "Client" : "Insider"}
                  </span>
                  <span className="text-[10px] opacity-60 mt-1.5 uppercase tracking-tighter">
                    {r === "client" ? "I want answers" : "I know stuff"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <PrimaryButton type="submit">Create account</PrimaryButton>
            <p className="text-center text-xs text-zinc-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
