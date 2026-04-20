"use client";

import { useState, type ReactNode } from "react";
import type { Role } from "@/lib/types";
import { useRouter } from "next/navigation";

type Step = "email" | "password" | "signup";

function FieldInput({
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-all font-sans"
    />
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-white text-black rounded-full py-3 text-sm font-semibold hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer font-sans"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-transparent text-zinc-400 border border-white/10 rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer font-sans"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-transparent text-zinc-500 text-xs py-2 hover:text-white transition-colors cursor-pointer font-sans"
    >
      {children}
    </button>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-zinc-500 text-xs mb-6 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-sans"
    >
      ← {label}
    </button>
  );
}

function EmailForm({
  email,
  setEmail,
  onContinue,
  onSignIn,
}: {
  email: string;
  setEmail: (v: string) => void;
  onContinue: () => void;
  onSignIn: () => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          Vekko
        </h1>
        <p className="text-sm text-zinc-500">The first matching marketplace for insight</p>
      </div>

      <div className="flex flex-col gap-4">
        <FieldInput placeholder="your@email.com" value={email} onChange={setEmail} />
        {/* TODO: validate email format; POST /auth/check-email { email } → determine if sign-in or sign-up */}
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        {/* TODO: OAuth flow — redirect to /auth/google → Google consent → callback sets JWT cookie */}
        <SecondaryButton>
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
        <GhostButton onClick={onSignIn}>Already have an account? Sign in</GhostButton>
      </div>
    </div>
  );
}

function PasswordForm({
  email,
  onBack,
  onToSignup,
}: {
  email: string;
  onBack: () => void;
  onToSignup: () => void;
}) {
  const [password, setPassword] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  function handleForgot() {
    // TODO: POST /auth/forgot-password { email } → sends password reset email
    setForgotSent(true);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <BackButton label={email || "back"} onClick={onBack} />
      <h2 className="text-2xl font-bold mb-6 text-white">Welcome back</h2>

      <div className="flex flex-col gap-4">
        <FieldInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
        />
        {/* TODO: POST /auth/login { email, password } → returns JWT + role; set cookie and redirect */}
        <PrimaryButton type="submit">Sign in</PrimaryButton>
        <div className="flex flex-col gap-1 mt-4">
          {forgotSent ? (
            <p className="text-center text-xs text-zinc-500 py-2">Check your email for a reset link.</p>
          ) : (
            <GhostButton onClick={handleForgot}>Forgot password?</GhostButton>
          )}
          <GhostButton onClick={onToSignup}>New here? Create an account</GhostButton>
        </div>
      </div>
    </div>
  );
}

function SignupForm({
  email,
  onBack,
  onToSignin,
}: {
  email: string;
  onBack: () => void;
  onToSignin: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("client");
  const router = useRouter();

  function handleRoleButtonClick(selectedRole: Role) {
    setRole(selectedRole);
    // Set a cookie so the server knows the role on the next page load
    document.cookie = `user-role=${selectedRole}; path=/; max-age=3600`;

    router.push(`/dashboard?role=${selectedRole}`);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <BackButton label={email || "back"} onClick={onBack} />
      <h2 className="text-2xl font-bold mb-6 text-white">Create account</h2>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <FieldInput placeholder="First name" value={firstName} onChange={setFirstName} />
          <FieldInput placeholder="Last name" value={lastName} onChange={setLastName} />
        </div>
        <FieldInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
        />

        <div className="mt-2">
          <p className="text-[11px] text-zinc-500 mb-3 uppercase tracking-widest font-bold">
            I am a…
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["client", "insider"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleButtonClick(r)}
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
          {/* TODO: POST /auth/register { email, firstName, lastName, password, role } → returns JWT + role */}
          <PrimaryButton type="submit">Create account</PrimaryButton>
          <GhostButton onClick={onToSignin}>Already have an account? Sign in</GhostButton>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const renderContent = () => {
    switch (step) {
      case "email":
        return (
          <EmailForm
            email={email}
            setEmail={setEmail}
            onContinue={() => setStep("signup")}
            onSignIn={() => setStep("password")}
          />
        );
      case "password":
        return (
          <PasswordForm
            email={email}
            onBack={() => setStep("email")}
            onToSignup={() => setStep("signup")}
          />
        );
      case "signup":
        return (
          <SignupForm
            email={email}
            onBack={() => setStep("email")}
            onToSignin={() => setStep("password")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white selection:bg-white selection:text-black font-sans relative overflow-hidden">
      {/* Dynamic Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-white/2 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-white/1 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-4xl p-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative z-10 animate-in fade-in duration-1000">
        {renderContent()}
      </div>
    </main>
  );
}
