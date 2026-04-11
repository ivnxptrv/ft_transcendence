# Auth & Missing Pages — Design Spec

Date: 2026-04-11

## Scope

Five additions to the web app:

1. `/login` — unified auth page (sign in + sign up, email-first)
2. New order modal — bottom sheet on the client dashboard
3. `/legend` — insider legend editor (modal on insider dashboard)
4. `/settings` — realistic scaffold, role-adaptive theme
5. `/wallet` — realistic scaffold, role-adaptive theme

## 1. `/login`

### Route
`/login` — replaces the empty `/login/page.tsx`. The empty `/signup` file is removed.

### Flow — 3 states, no navigation between them

**State 1: Email entry (default)**
- Brand name + tagline ("A first matching marketplace")
- Single email input
- "Continue" primary CTA
- "Continue with Google" secondary CTA (non-functional placeholder for now)

**State 2a: Returning user**
- Shows entered email as a clickable "back" link (resets to state 1)
- Password input
- "Sign in" CTA
- "Forgot password?" link (non-functional for now)

**State 2b: New user**
- Shows entered email as a clickable "back" link
- "Create your account" heading
- First name + last name inputs (side by side)
- Password input
- Role selector: two toggle cards — "Client / I have questions" and "Insider / I have answers"
- "Create account" CTA

### State determination
For now: the email check (`exists: true/false`) is mocked. Dev default renders state 2b. A `?returning=true` URL param can force state 2a during development.

### Theme
Dark (`#0f0f0f` background) — no role known yet.

### DB fields captured on sign-up
`first_name`, `last_name`, `email`, `password`, `role` — maps directly to the `users` table schema.

---

## 2. New Order Modal

### Trigger
The "+ New request" button in `ClientDashboard.tsx` opens a bottom sheet modal. No route change.

### Modal content (dark theme, matches dashboard)
- Header: "New request" + close (✕)
- Title input (single line)
- Query textarea with placeholder: "What do you actually want to know? Be specific — the more context you give, the better the match."
- "Publish request" CTA

### Behaviour
- Modal state lives in `ClientDashboard` via `useState`
- Backdrop dims the orders list behind
- Close: ✕ button or clicking backdrop
- On submit: adds mock order to local state (real API call deferred to auth phase)

---

## 3. Legend Modal

### Trigger
The "Update My Legend" button in `InsiderDashboard.tsx` opens a bottom sheet modal. No route — same pattern as the new order modal.

### Modal content (cream theme, `#faf9f7`)
- Header: "Your legend" + close (✕)
- Subtext: "This is what clients see before buying. Write from experience — who you are and what you know."
- Large textarea with placeholder: `e.g. "Freelance developer, 4 years in Bangkok after leaving corporate…"`
- "Save legend" CTA

### Behaviour
- Pre-fills with existing legend text if available (from `InsiderProfile` mock data)
- Modal state lives in `InsiderDashboard` via `useState`
- On save: updates local state (real API call deferred)

---

## 4. `/settings`

### Theme
Role-adaptive: dark (`#0f0f0f`) for clients, cream (`#faf9f7`) for insiders. Since auth doesn't exist yet, role is read from a `MockRoleContext` (see Implementation Notes).

### Layout — two sections

**Account**
- Change email (row with chevron, non-functional)
- Change password (row with chevron, non-functional)

**Developer**
- API key row: masked value (`sk-••••••••`) + "copy" button (non-functional)
- Docs (row with external link arrow, non-functional)

**Danger zone** (separate section)
- Sign out (red text, non-functional)

---

## 5. `/wallet`

### Theme
Same role-adaptive theming as settings.

### Layout

**Balance card**
- Label: "BALANCE"
- Amount: `฿ 1,200` (mock)
- "Top up" primary CTA (non-functional)
- "Withdraw" secondary CTA (non-functional)

**Transactions list**
- Section label: "TRANSACTIONS"
- Rows: description + date on the left, +/- amount in green/red on the right
- 3 placeholder rows from mock data

---

## Implementation Notes

### MockRoleContext
Settings and wallet need a role to pick their theme. Until auth is wired:

```tsx
// src/lib/mock-role.ts
export const MOCK_ROLE: Role = "insider"; // toggle manually during dev
```

Both pages import this and use it to select theme values. When real auth lands, replace with a session hook.

### No new routes for the create forms
Both modals live in their respective dashboard components. No `app/orders/new/page.tsx` or `app/legend/page.tsx` are created.

### File changes summary
| Action | File |
|---|---|
| Replace | `src/app/login/page.tsx` |
| Delete | `src/app/signup/page.tsx` (if it exists) |
| Replace | `src/app/settings/page.tsx` |
| Replace | `src/app/wallet/page.tsx` |
| Modify | `src/app/dashboard/_components/ClientDashboard.tsx` (add new order modal) |
| Modify | `src/app/dashboard/_components/InsiderDashboard.tsx` (add legend modal) |
| Create | `src/lib/mock-role.ts` |
