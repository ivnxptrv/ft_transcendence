import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loginTwoFA } from "@/actions/auth";
import { FieldInput, PrimaryButton } from "@/app/(auth)/_components/auth";
import { CHALLENGE_COOKIE } from "@/lib/auth-shared";

type PageProps = {
  searchParams: Promise<{ error?: string; mode?: string }>;
};

export default async function TwoFAPage({ searchParams }: PageProps) {
  // Bounce to /login if the challenge cookie is missing or expired — the
  // user can't complete 2FA without it.
  const cookieStore = await cookies();
  if (!cookieStore.get(CHALLENGE_COOKIE)) {
    redirect("/login");
  }

  const { error, mode } = await searchParams;
  const isRecovery = mode === "recovery";

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white selection:bg-white selection:text-black font-sans relative overflow-hidden">
      {/* Match the login page's background treatment */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-white/2 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-white/1 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-4xl p-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative z-10 animate-in fade-in duration-1000">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Two-factor authentication
          </h1>
          <p className="text-sm text-zinc-500">
            {isRecovery
              ? "Enter one of your recovery codes."
              : "Enter the 6-digit code from your authenticator app."}
          </p>
        </div>

        <form action={loginTwoFA} className="flex flex-col gap-4">
          <FieldInput
            name="code"
            type="text"
            placeholder={isRecovery ? "xxxxx-xxxxx" : "123456"}
            autocomplete="one-time-code"
            required
          />

          {error && (
            <p className="text-xs text-red-400 text-center -mt-1">Invalid code. Try again.</p>
          )}

          <PrimaryButton type="submit">Continue</PrimaryButton>

          <p className="text-center text-xs text-zinc-500 mt-6">
            {isRecovery ? (
              <Link href="/login/2fa" className="text-white hover:underline transition-all">
                Use authenticator code instead
              </Link>
            ) : (
              <Link
                href="/login/2fa?mode=recovery"
                className="text-white hover:underline transition-all"
              >
                Lost your phone? Use a recovery code
              </Link>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
