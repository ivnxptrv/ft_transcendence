# Auth & Missing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/login` (email-first, 3 states + Google), new-order bottom-sheet modal, `/legend` page, and realistic `/settings` + `/wallet` scaffolds with role-adaptive theming.

**Architecture:** Login is a `"use client"` page with local step state. The new-order form is a standalone `NewOrderButton` client component so `ClientDashboard` stays a server component (avoids `Date` serialization issues across the server/client boundary). Settings and wallet read `MOCK_ROLE` from a shared module to pick dark/cream theme tokens. `/legend` is a full page (not a modal) — `InsiderNav` already links to `/legend` as "My profile", so the spec's modal decision is overridden here.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, inline styles (follow existing codebase convention)

> ⚠️ Before writing any Next.js code, read `web/node_modules/next/dist/docs/` as required by `web/AGENTS.md`.

---

### Task 1: Extend types and add mock transaction data

**Files:**
- Modify: `web/src/lib/types.ts`
- Modify: `web/src/lib/mock-data.ts`

- [ ] **Step 1: Add `Transaction` type and `legend` field to `InsiderProfile` in `types.ts`**

Replace the `InsiderProfile` type and add `Transaction` after it:

```ts
export type InsiderProfile = {
  userId: string;
  legend?: string;
  credibilityScore: number;
  totalEarnings: number;
  totalResponses: number;
  avgRating: number;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number; // positive = credit (top-up/earnings), negative = debit (purchase)
  date: Date;
};
```

- [ ] **Step 2: Update `mock-data.ts` — import, profile legend, and mock transactions**

Update the import line:
```ts
import { Order, ResponseCard, Match, Insight, InsiderProfile, Transaction } from "@/lib/types";
```

Add `legend` to the first profile in `MOCK_INSIDER_PROFILE`:
```ts
{
  userId: "insider_001",
  legend: "Freelance developer, 4 years in Bangkok after leaving a corporate role in Singapore.",
  credibilityScore: 4.5,
  totalEarnings: 12000,
  totalResponses: 120,
  avgRating: 4.5,
},
```

Add mock transactions and getter after `MOCK_INSIDER_PROFILE`:
```ts
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001",
    description: "Unlocked insight",
    amount: -120,
    date: new Date("2025-01-14T10:00:00Z"),
  },
  {
    id: "txn_002",
    description: "Top up",
    amount: 500,
    date: new Date("2025-01-12T09:00:00Z"),
  },
  {
    id: "txn_003",
    description: "Unlocked insight",
    amount: -95,
    date: new Date("2025-01-10T14:30:00Z"),
  },
];

export async function getTransactions() {
  return MOCK_TRANSACTIONS;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd web && npm run build
```
Expected: clean build, no type errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/types.ts web/src/lib/mock-data.ts
git commit -m "feat: add Transaction type and mock wallet data"
```

---

### Task 2: Add mock-role module with theme tokens

**Files:**
- Create: `web/src/lib/mock-role.ts`

- [ ] **Step 1: Create the file**

```ts
import type { Role } from "@/lib/types";

// Toggle manually until real auth is wired in
export const MOCK_ROLE: Role = "insider";

export const THEMES = {
  dark: {
    bg: "#0f0f0f",
    surface: "#161616",
    border: "#222",
    borderSubtle: "#1f1f1f",
    text: "#e4e4e4",
    muted: "#555",
    subtle: "#333",
    label: "#444",
    primary: "#e4e4e4",
    primaryText: "#0f0f0f",
    danger: "#c0392b",
    inputBg: "#1a1a1a",
    inputBorder: "#2a2a2a",
  },
  cream: {
    bg: "#faf9f7",
    surface: "#fff",
    border: "#e8e5e0",
    borderSubtle: "#ede9e3",
    text: "#2a2520",
    muted: "#9a9088",
    subtle: "#b0a898",
    label: "#b0a898",
    primary: "#2a2520",
    primaryText: "#faf9f7",
    danger: "#c0392b",
    inputBg: "#fff",
    inputBorder: "#e8e5e0",
  },
} as const;

export type Theme = typeof THEMES.dark;

export function getTheme(role: Role): Theme {
  return role === "client" ? THEMES.dark : THEMES.cream;
}
```

- [ ] **Step 2: Verify build**

```bash
cd web && npm run build
```
Expected: clean compile.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/mock-role.ts
git commit -m "feat: add mock-role module with dark/cream theme tokens"
```

---

### Task 3: /login page

**Files:**
- Replace: `web/src/app/login/page.tsx`

The file is currently empty (1 line). Replace it entirely.

- [ ] **Step 1: Write the login page**

```tsx
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
```

- [ ] **Step 2: Verify build**

```bash
cd web && npm run build
```
Expected: clean build.

- [ ] **Step 3: Visual check** — navigate to `http://localhost:3000/login`:
  - Type an email → click "Continue" → signup form appears with role selector
  - Click "Already have an account?" → password form appears
  - Click the email back-link → returns to email step
  - Role cards toggle highlight on click

- [ ] **Step 4: Commit**

```bash
git add web/src/app/login/page.tsx
git commit -m "feat: add email-first login page with 3-state flow"
```

---

### Task 4: /legend page

**Files:**
- Create: `web/src/app/legend/page.tsx`

> Note: spec said modal, but `InsiderNav` already links `/legend` as "My profile". Full page is correct here.

- [ ] **Step 1: Create the legend page**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_INSIDER_PROFILE } from "@/lib/mock-data";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

const existingLegend = MOCK_INSIDER_PROFILE[0]?.legend ?? "";

export default function LegendPage() {
  const [legend, setLegend] = useState(existingLegend);

  return (
    <div style={{ background: "#faf9f7", minHeight: "100vh", color: "#2a2520" }}>
      <InsiderNav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <p
          style={{ fontSize: 10, color: "#b0a898", letterSpacing: "0.12em" }}
          className="font-medium uppercase mb-1"
        >
          Your legend
        </p>
        <p style={{ fontSize: 12, color: "#9a9088", lineHeight: 1.5 }} className="mb-5">
          This is what clients see before buying. Write from experience — who you are and what you
          know.
        </p>
        <textarea
          value={legend}
          onChange={(e) => setLegend(e.target.value)}
          placeholder='e.g. "Freelance developer, 4 years in Bangkok after leaving corporate…"'
          style={{
            width: "100%",
            background: "#fff",
            border: "0.5px solid #e8e5e0",
            borderRadius: 10,
            padding: "12px",
            fontSize: 13,
            color: "#3a3530",
            lineHeight: 1.65,
            resize: "none",
            height: 180,
            boxSizing: "border-box",
            fontFamily: "inherit",
            outline: "none",
          }}
          className="mb-4"
        />
        <button
          type="button"
          style={{
            width: "100%",
            background: "#2a2520",
            color: "#faf9f7",
            border: "none",
            borderRadius: 20,
            padding: "11px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Save legend
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd web && npm run build
```
Expected: clean build.

- [ ] **Step 3: Visual check** — navigate to `http://localhost:3000/dashboard?role=insider`, click "My profile" in the nav:
  - Textarea pre-fills with the mock legend text
  - Editing the textarea updates locally
  - "Save legend" button is visible

- [ ] **Step 4: Commit**

```bash
git add web/src/app/legend/page.tsx
git commit -m "feat: add /legend page for insider profile editor"
```

---

### Task 5: New order modal in ClientDashboard

**Files:**
- Create: `web/src/app/dashboard/_components/NewOrderButton.tsx`
- Modify: `web/src/app/dashboard/_components/ClientDashboard.tsx`

`ClientDashboard` stays a server component. Only the button + modal is extracted as a client component to avoid `Date` serialisation issues.

- [ ] **Step 1: Create `NewOrderButton.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function NewOrderButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");

  function handleClose() {
    setOpen(false);
    setTitle("");
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ fontSize: 11, background: "#e4e4e4", color: "#0f0f0f" }}
        className="font-medium px-3 py-1.5 rounded-full"
      >
        + New request
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 40,
            }}
          />

          {/* Bottom sheet */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#161616",
              border: "0.5px solid #2a2a2a",
              borderRadius: "16px 16px 0 0",
              padding: "20px 20px 32px",
              zIndex: 50,
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 16 }}
            >
              <span style={{ fontSize: 14, color: "#e4e4e4", fontWeight: 500 }}>
                New request
              </span>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#555",
                  fontSize: 18,
                  cursor: "pointer",
                  lineHeight: 1,
                  fontFamily: "inherit",
                }}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: "0.5px solid #2a2a2a",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                color: "#e4e4e4",
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
                marginBottom: 8,
              }}
            />
            <textarea
              placeholder="What do you actually want to know? Be specific — the more context you give, the better the match."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: "0.5px solid #2a2a2a",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                color: "#e4e4e4",
                lineHeight: 1.6,
                resize: "none",
                height: 110,
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
                marginBottom: 14,
              }}
            />
            <button
              type="button"
              style={{
                width: "100%",
                background: "#e4e4e4",
                color: "#0f0f0f",
                border: "none",
                borderRadius: 20,
                padding: "11px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Publish request
            </button>
          </div>
        </>
      )}
    </>
  );
}
```

- [ ] **Step 2: Replace the `+ New request` button in `ClientDashboard.tsx`**

Remove the import of `Link` if no longer needed elsewhere (keep it — it's still used for order links).

Replace:
```tsx
<Link
  href="/orders/new"
  style={{ fontSize: 11, background: "#e4e4e4", color: "#0f0f0f" }}
  className="font-medium px-3 py-1.5 rounded-full"
>
  + New request
</Link>
```

With:
```tsx
<NewOrderButton />
```

Add the import at the top of `ClientDashboard.tsx`:
```tsx
import NewOrderButton from "./NewOrderButton";
```

- [ ] **Step 3: Verify build**

```bash
cd web && npm run build
```
Expected: clean build.

- [ ] **Step 4: Visual check** — navigate to `http://localhost:3000/dashboard`:
  - "+ New request" button opens the bottom sheet
  - Backdrop click closes it
  - ✕ button closes it and clears fields
  - The orders list is visible dimmed behind

- [ ] **Step 5: Commit**

```bash
git add web/src/app/dashboard/_components/NewOrderButton.tsx web/src/app/dashboard/_components/ClientDashboard.tsx
git commit -m "feat: add new-order bottom sheet modal to client dashboard"
```

---

### Task 6: /settings page

**Files:**
- Replace: `web/src/app/settings/page.tsx`

- [ ] **Step 1: Write the settings page**

```tsx
import type { ReactNode } from "react";
import { MOCK_ROLE, getTheme } from "@/lib/mock-role";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

function SettingsRow({
  label,
  right,
  danger,
  t,
}: {
  label: string;
  right?: ReactNode;
  danger?: boolean;
  t: ReturnType<typeof getTheme>;
}) {
  return (
    <div
      style={{
        padding: "11px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: 13, color: danger ? t.danger : t.text }}>{label}</span>
      {right && <span style={{ fontSize: 12, color: t.muted }}>{right}</span>}
    </div>
  );
}

function SettingsGroup({
  rows,
  t,
}: {
  rows: ReactNode[];
  t: ReturnType<typeof getTheme>;
}) {
  return (
    <div
      style={{
        background: t.surface,
        border: `0.5px solid ${t.border}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 24,
      }}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          style={
            i < rows.length - 1
              ? { borderBottom: `0.5px solid ${t.borderSubtle}` }
              : undefined
          }
        >
          {row}
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const t = getTheme(MOCK_ROLE);
  const Nav = MOCK_ROLE === "client" ? ClientNav : InsiderNav;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
      <Nav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <p
          style={{ fontSize: 10, color: t.label, letterSpacing: "0.12em" }}
          className="font-medium uppercase mb-5"
        >
          Settings
        </p>

        <p style={{ fontSize: 10, color: t.subtle, letterSpacing: "0.1em" }} className="uppercase font-medium mb-2">
          Account
        </p>
        <SettingsGroup
          t={t}
          rows={[
            <SettingsRow key="email" label="Change email" right="›" t={t} />,
            <SettingsRow key="password" label="Change password" right="›" t={t} />,
          ]}
        />

        <p style={{ fontSize: 10, color: t.subtle, letterSpacing: "0.1em" }} className="uppercase font-medium mb-2">
          Developer
        </p>
        <SettingsGroup
          t={t}
          rows={[
            <SettingsRow
              key="apikey"
              label="API key"
              right={
                <span>
                  <span style={{ fontFamily: "monospace" }}>sk-••••••••</span>
                  {"  "}
                  <span style={{ color: t.muted, fontSize: 11 }}>copy</span>
                </span>
              }
              t={t}
            />,
            <SettingsRow key="docs" label="Docs" right="↗" t={t} />,
          ]}
        />

        <SettingsGroup
          t={t}
          rows={[<SettingsRow key="signout" label="Sign out" danger t={t} />]}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd web && npm run build
```
Expected: clean build.

- [ ] **Step 3: Visual check** — navigate to `http://localhost:3000/settings`:
  - With `MOCK_ROLE = "insider"` in `mock-role.ts`: cream background, InsiderNav
  - Switch to `MOCK_ROLE = "client"`: dark background, ClientNav

- [ ] **Step 4: Commit**

```bash
git add web/src/app/settings/page.tsx
git commit -m "feat: scaffold settings page with role-adaptive theming"
```

---

### Task 7: /wallet page

**Files:**
- Replace: `web/src/app/wallet/page.tsx`

- [ ] **Step 1: Write the wallet page**

```tsx
import { MOCK_ROLE, getTheme } from "@/lib/mock-role";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

const MOCK_BALANCE = 1200;

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function WalletPage() {
  const t = getTheme(MOCK_ROLE);
  const Nav = MOCK_ROLE === "client" ? ClientNav : InsiderNav;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
      <Nav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        {/* Balance card */}
        <div
          style={{
            background: t.surface,
            border: `0.5px solid ${t.border}`,
            borderRadius: 12,
            padding: "16px",
            marginBottom: 24,
          }}
        >
          <p
            style={{ fontSize: 10, color: t.label, letterSpacing: "0.12em" }}
            className="font-medium uppercase mb-1"
          >
            Balance
          </p>
          <p style={{ fontSize: 26, fontWeight: 500, marginBottom: 14 }}>
            ฿ {MOCK_BALANCE.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              style={{
                flex: 1,
                background: t.primary,
                color: t.primaryText,
                border: "none",
                borderRadius: 20,
                padding: "9px",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Top up
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                background: "none",
                color: t.muted,
                border: `0.5px solid ${t.border}`,
                borderRadius: 20,
                padding: "9px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Transactions */}
        <p
          style={{ fontSize: 10, color: t.subtle, letterSpacing: "0.1em" }}
          className="font-medium uppercase mb-2"
        >
          Transactions
        </p>
        <div
          style={{
            background: t.surface,
            border: `0.5px solid ${t.border}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {MOCK_TRANSACTIONS.map((txn, i) => (
            <div
              key={txn.id}
              style={{
                padding: "11px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom:
                  i < MOCK_TRANSACTIONS.length - 1
                    ? `0.5px solid ${t.borderSubtle}`
                    : undefined,
              }}
            >
              <div>
                <span style={{ fontSize: 13, color: t.text }}>{txn.description}</span>
                <span style={{ fontSize: 11, color: t.muted, marginLeft: 8 }}>
                  {formatDate(txn.date)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: txn.amount > 0 ? "#3d9e5f" : "#c0392b",
                }}
              >
                {txn.amount > 0 ? "+" : ""}฿{Math.abs(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd web && npm run build
```
Expected: clean build.

- [ ] **Step 3: Visual check** — navigate to `http://localhost:3000/wallet`:
  - Balance card shows ฿ 1,200, Top up and Withdraw buttons
  - 3 transaction rows with correct +/- colour coding
  - Toggle `MOCK_ROLE` in `mock-role.ts` to verify dark ↔ cream theming

- [ ] **Step 4: Commit**

```bash
git add web/src/app/wallet/page.tsx
git commit -m "feat: scaffold wallet page with balance and transaction history"
```
