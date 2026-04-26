- The parent page wallet/page.tsx:10 is already async (a Server Component) and is already
  fetching data server-side — it's just using mocks instead of your real server action.

So the card is already pure presentation. No client hooks are being used.

What needs to change to wire it to the real server actions

Only the parent page needs a small change. Replace the mock imports at wallet/page.tsx:1-8 with
your real actions from @/actions/transactions:

import { getBalance, getTransactions } from "@/actions/transactions";
// ...
const [balance, transactions] = await Promise.all([getBalance(), getTransactions()]);

Then pass balance and transactions into <WalletBalanceCard />. The card itself stays untouched
— you can even delete the commented-out "use client" and the unused getBalance import at line 6
to clean it up.

★ Insight ─────────────────────────────────────

- Server Components vs. Server Actions for reads: Server Actions are really designed for
  mutations invoked from forms/buttons. For initial reads, calling the same underlying fetch()
  directly inside a Server Component (the page) is cleaner — no extra round-trip, no need for a
  POST-like action envelope. Your getBalance() / getTransactions() are marked "use server" but
  they're just async functions — they work fine when awaited in a Server Component too.
- The "island" pattern: When top-up/withdraw come back, you don't need to turn the whole card
  into a client component. Keep the balance/transactions list server-rendered, and only extract
  the modal + amount input into a small <TopupDialog /> client island. Server Actions +
  revalidatePath('/wallet') will refresh the server-rendered parts after a mutation — no useState
  mirror needed.
- Props hygiene: Once you're server-rendering, the initialBalance / initialTransactions names
  become misleading (they imply "initial, then client takes over"). Rename to balance /
  transactions to signal it's the single source of truth.
  ─────────────────────────────────────────────────

One bug worth flagging while you're in there

In actions/transactions.ts:6, getCurrentUser() is called without await, but its name suggests
it's async (and auth()-style helpers in Next.js usually are). If getCurrentUser returns a
Promise, userId will be [object Promise] in the URL. Worth checking.

Summary

The card can (and should) be 100% server-rendered right now — nothing about displaying balance
and transactions requires a client. The only change needed is swapping the mock data in
wallet/page.tsx for your getBalance() / getTransactions() actions. Want me to make that edit?
