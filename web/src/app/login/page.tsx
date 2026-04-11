"use client";

import { useState, type ReactNode } from "react";
import type { Role } from "@/lib/types";

type Step = "email" | "password" | "signup";

// Shared style tokens for this page (dark — no role known yet)
const T = {
  bg: "#0f0f0f",
  surface: "#161616",
  border: "#2a2a2a",
  text: "#e4e4e4",
  muted: "#555",
  dim: "#333",
  inputBg: "#1a1a1a",
};

function FieldInput({
  type = "text",
  placeholder,
  value,
  onChange,
  style,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: T.inputBg,
        border: `0.5px solid ${T.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 13,
        color: T.text,
        fontFamily: "inherit",
        boxSizing: "border-box",
        outline: "none",
        ...style,
      }}
    />
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: T.text,
        color: T.bg,
        border: "none",
        borderRadius: 20,
        padding: "10px",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
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
      style={{
        background: "none",
        border: "none",
        color: T.dim,
        fontSize: 11,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "center" as const,
        width: "100%",
        padding: "4px 0",
      }}
    >
      {children}
    </button>
  );
}

function BackLink({ email, onClick }: { email: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: T.muted,
        fontSize: 11,
        cursor: "pointer",
        fontFamily: "inherit",
        padding: 0,
        marginBottom: 20,
        display: "block",
      }}
    >
      ← {email || "back"}
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
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 20, color: T.text, fontWeight: 500, marginBottom: 4 }}>Vekko</div>
        <div style={{ fontSize: 12, color: T.muted }}>A first matching marketplace</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FieldInput placeholder="your@email.com" value={email} onChange={setEmail} />
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        <button
          type="button"
          style={{
            width: "100%",
            background: "none",
            color: "#888",
            border: `0.5px solid ${T.border}`,
            borderRadius: 20,
            padding: "10px",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>G</span>
          Continue with Google
        </button>
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

  return (
    <div>
      <BackLink email={email} onClick={onBack} />
      <div style={{ fontSize: 15, color: T.text, fontWeight: 500, marginBottom: 20 }}>
        Welcome back
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FieldInput
          type="password"
          placeholder="password"
          value={password}
          onChange={setPassword}
        />
        <PrimaryButton>Sign in</PrimaryButton>
        <GhostButton>Forgot password?</GhostButton>
        <GhostButton onClick={onToSignup}>New here? Create an account</GhostButton>
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

  return (
    <div>
      <BackLink email={email} onClick={onBack} />
      <div style={{ fontSize: 15, color: T.text, fontWeight: 500, marginBottom: 20 }}>
        Create your account
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <FieldInput placeholder="First name" value={firstName} onChange={setFirstName} />
          <FieldInput placeholder="Last name" value={lastName} onChange={setLastName} />
        </div>
        <FieldInput
          type="password"
          placeholder="password"
          value={password}
          onChange={setPassword}
        />
        <div>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>I am a…</p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["client", "insider"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  background: "none",
                  border: `0.5px solid ${role === r ? T.text : T.border}`,
                  borderRadius: 8,
                  padding: "10px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: role === r ? T.text : T.muted,
                    fontWeight: 500,
                  }}
                >
                  {r === "client" ? "Client" : "Insider"}
                </div>
                <div
                  style={{ fontSize: 10, color: role === r ? "#888" : T.dim, marginTop: 2 }}
                >
                  {r === "client" ? "I have questions" : "I have answers"}
                </div>
              </button>
            ))}
          </div>
        </div>
        <PrimaryButton>Create account</PrimaryButton>
        <GhostButton onClick={onToSignin}>Already have an account? Sign in</GhostButton>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: T.text,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360, padding: "0 24px" }}>
        {step === "email" && (
          <EmailForm
            email={email}
            setEmail={setEmail}
            onContinue={() => setStep("signup")}
            onSignIn={() => setStep("password")}
          />
        )}
        {step === "password" && (
          <PasswordForm
            email={email}
            onBack={() => setStep("email")}
            onToSignup={() => setStep("signup")}
          />
        )}
        {step === "signup" && (
          <SignupForm
            email={email}
            onBack={() => setStep("email")}
            onToSignin={() => setStep("password")}
          />
        )}
      </div>
    </div>
  );
}
