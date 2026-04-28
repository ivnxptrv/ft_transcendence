# Next App Study and Coding Goals

This note aligns my current Next.js work in `web/` with the real
`ft_transcendence` subject requirements in `web/docs/en.subject.pdf`.

The focus here is intentionally narrow: frontend, Next server actions, auth/session
handling, route protection, UI behavior, and documentation evidence for the parts I
touch. Backend services, DevOps infrastructure, database ownership, and monitoring are
team/project requirements, but they are not my current module scope unless I explicitly
pick up work there later.

## Subject Requirements That Affect My Next App Work

Even if other teammates own backend or infrastructure, the Next app must still support
the mandatory project requirements:

- Clear, responsive, accessible frontend across devices.
- Styling solution used consistently.
- Latest stable Chrome compatibility.
- No browser console warnings or errors.
- Accessible Privacy Policy and Terms of Service pages linked from the app.
- Signup and login UI that connects to secure backend auth.
- Frontend validation for all forms and user input.
- Server action validation for data submitted through the Next app.
- Session handling that does not trust client-editable state.
- Multi-user behavior in the UI: no hardcoded current user, no shared fake state, and
  user-specific views derived from the verified session.
- `.env.example` entries for Next-facing configuration such as backend service URLs and
  JWT/session-related settings.
- README evidence for the frontend stack, implemented features, modules I worked on,
  and how AI was used.

## Modules Related To My Current Next App Scope

These are the subject modules that are relevant to my current work. They are candidates,
not guaranteed points, until the behavior is fully implemented and demoable.

| Module | Points | Relevant Next app work | What I must be able to demo/explain |
| --- | ---: | --- | --- |
| Web: frontend framework | 1 | Next.js/React app routes, components, server actions, layouts | Why Next/React is used and where framework features are used |
| Web: frontend + backend framework | 2 | Only if the team counts Next server actions/API behavior plus backend framework usage together | How frontend and backend framework responsibilities are split |
| Web: SSR | 1 | Server-rendered pages, server components, session-aware rendering | Which pages are SSR/server-rendered and why it improves UX/SEO |
| Web: custom design system | 1 | Reusable UI components, consistent colors, typography, icons | At least 10 reusable components and consistent visual rules |
| Web: user interaction | 2 | UI for profiles, friends, and chat if assigned in Next | Chat, profile viewing, friend add/remove/list flows |
| User Management: standard auth/profile | 2 | Login/signup pages, session-aware UI, profile pages/forms | Auth flow plus profile update, avatar/default avatar, friends, online status |
| User Management: OAuth | 1 | OAuth buttons/callback UI if assigned | OAuth login flow and backend/session handoff |
| User Management: 2FA | 1 | 2FA setup/verify UI if assigned | Enrollment, verification, recovery/error states |
| Accessibility: WCAG 2.1 AA | 2 | Semantic markup, keyboard navigation, focus states, screen reader support | Keyboard-only walkthrough and accessibility checks |
| i18n: 3 languages | 1 | Translation system and language switcher if assigned | Complete translated user-facing text in 3 languages |
| Data: analytics dashboard | 2 | Dashboard UI, filters, charts, export controls if assigned | Interactive charts, date filters, real-time updates, export |

Modules currently outside my scope unless reassigned:

- DevOps: ELK, Prometheus/Grafana, backend microservices, backups.
- Backend/database modules such as ORM ownership.
- Cybersecurity WAF/Vault.
- Blockchain.
- Game modules, unless the product direction changes to include a game in the Next app.

## Current Auth Session Study Context

- `login()` and `signup()` currently generate JWTs locally with `jose`.
- The JWT stores:
  - `sub=userId`
  - `role=client|insider`
- The JWT is stored in an HttpOnly cookie named `jwt_token`.
- `logout()` deletes `jwt_token` and redirects to `/login`.
- `getCurrentUser()` reads `jwt_token`, verifies it, and returns `{ userId, role }`.
- Dashboard, settings, and wallet render client vs insider UI from `getCurrentUser()`.
- `SessionSection` is a server component using `<form action={logout}>`.
- This is temporary. Final auth should use backend login/signup responses, while the
  Next app remains responsible for safe form handling, session storage, redirects, and
  session-aware rendering.

## Auth Study Conclusions

- The signup page has only two normal UI role choices, but form input is still untrusted
  server input.
- Hidden inputs can be edited in DevTools or bypassed by submitting a custom request.
- `role as Role` is not runtime validation; it only tells TypeScript to trust the value.
- Server-side role validation is needed before signing or accepting a JWT.
- Invalid signup role is treated as tampering or invalid input, so redirecting back to
  `/signup` is enough for now.
- Returning form errors with `useActionState` is better saved for real user-facing
  backend errors such as duplicate email, invalid password, or backend failure.
- `useState<Role>("client")` in the signup page is valid UI state, not old mock session
  state.
- Old mock role code would look like a `user-role` cookie, localStorage role, or pages
  deriving role without `getCurrentUser()`.

## Proxy vs getCurrentUser

- `proxy.ts` answers: "Can this request enter this protected route?"
- `getCurrentUser()` answers: "Who is this user, and can server code trust their
  `userId` and `role`?"
- Both verify the JWT because they run at different layers.
- Proxy currently matches authenticated app pages:
  - `/dashboard/:path*`
  - `/orders/:path*`
  - `/matches/:path*`
  - `/settings/:path*`
  - `/wallet/:path*`
- `getCurrentUser()` is stricter than middleware today because it validates both:
  - `payload.sub` is a string
  - `payload.role` is `client` or `insider`
- The double verification is intentional layered protection, not accidental duplication.

## My Coding Priorities In The Next App

### 1. Make Route Protection Clear

- Decide which routes are public and which require a session.
- Keep `proxy.ts` covering authenticated app pages:
  - `/dashboard`
  - `/orders/[id]`
  - `/matches/[id]`
  - `/settings`
  - `/wallet`
- Keep `getCurrentUser()` in server pages/actions as the trusted identity reader.
- Avoid route logic that depends on client-controlled query params or local storage.

### 2. Make Auth UI Ready For Real Backend Responses

- Keep login/signup pages shaped around real backend auth, not fake local state.
- Connect `login()` to the Identity Service response when available.
- Connect `signup()` to the Identity Service and send the full form payload.
- Keep `jwt_token` HttpOnly.
- Validate form values before making backend calls.
- Add user-facing error handling with `useActionState` when backend errors are real
  enough to display.

### 3. Remove Frontend User Hardcoding

- Avoid hardcoded `user_123` in final flows.
- Derive current user identity from verified session claims.
- Ensure client and insider UI branches come from trusted session data.
- Test two browser sessions with different roles/users.

### 4. Support User Management UI If This Module Is Claimed

Auth alone is not enough for the Standard User Management major module. If this module
is in my scope, the Next app needs UI for:

- Profile display.
- Profile update.
- Avatar upload with default avatar state.
- Friend add/remove/list.
- Online status.

### 5. Keep The Frontend Evaluation-ready

- Fix browser console warnings/errors.
- Keep layouts responsive.
- Use semantic HTML and keyboard-accessible controls.
- Add or wire Privacy Policy and Terms of Service pages.
- Keep loading, error, empty, and unauthorized states understandable.
- Document any frontend limitations honestly.

### 6. Document My Part As I Build

For README or docs, collect evidence for:

- Frontend stack: Next.js, React, TypeScript, Tailwind.
- Routes/pages I implemented.
- Server actions I worked on.
- Auth/session behavior I can explain.
- Modules my work contributes to.
- Known limitations and what belongs to backend/infrastructure teammates.
- AI usage: what was generated, reviewed, rewritten, or used for study.

## Tomorrow Handoff

Continue in study-guide mode: I write the code, and the assistant explains theory,
checks my reasoning, and reviews my diffs. Do not patch code unless I explicitly ask.

### Current Auth Model To Remember

- `proxy.ts` is the route-entry gate for authenticated app pages.
- `getCurrentUser()` is the strict server helper for trusted `userId` and `role`.
- `getCurrentUser()` should stay strict: it returns `SessionUser` or redirects to
  `/login`; it should not return `null` for protected pages.
- Query params are untrusted and should be ignored unless explicitly parsed and
  validated.
- `error.tsx` is a client error boundary and must not import `getCurrentUser()` or
  `next/headers`.
- Global `not-found.tsx` should stay generic and should not require auth.

### What Was Learned

- Cookies are stored by the browser but sent to the server with requests.
- `HttpOnly` prevents browser JavaScript from reading the cookie, but server code can
  read it from the request using `cookies()`.
- Dashboard checks do not protect direct visits to detail URLs like `/orders/[id]` or
  `/matches/[id]`.
- Page-level role checks are useful now, but true resource ownership waits for backend
  endpoints.
- Current model: proxy checks "logged in", page checks "correct role", backend later
  checks "owns or is assigned this resource".

### Next Exercise: Auth Gap Audit

Fill this table before coding more auth changes:

| Area | Current behavior | Desired behavior | Reason |
| --- | --- | --- | --- |
| Root page |  |  |  |
| Wallet page |  |  |  |
| Auth helper |  |  |  |
| Transaction actions |  |  |  |

Focus on:

- What is temporary mock behavior?
- What already uses trusted session claims?
- Where is `user_123` or other hardcoded identity still present?
- Which gaps are frontend responsibilities now?
- Which gaps must wait for backend ownership checks?

### Likely Next Coding Topics

- Clean up root page behavior: either always redirect to `/login`, or require auth and
  redirect valid users to `/dashboard`.
- Review wallet reads: the page has role-aware UI, but balance and transaction reads are
  still mocked.
- Keep documenting backend-dependent TODOs near mocked resource fetches, especially
  order ownership and match assignment checks.

## Latest Committed Context

- Latest relevant commit from the study thread:
  - `bbfc12a1 chore: document and clean up temporary JWT signup flow`
- Commit message convention going forward:
  - use prefixes such as `feat:`, `fix:`, `chore:`, etc.

## Known Follow-ups

- Later, add `useActionState` to login/signup when real backend responses create
  user-facing validation errors.
- Later, add a logout pending state with a tiny client child if better UX is desired.
- Later, replace temporary local JWT generation with real backend login/signup responses.
- Lint currently has known non-blocking issues, including quote escaping in
  `InsightCardView.tsx` and several prototype unused-variable warnings.
