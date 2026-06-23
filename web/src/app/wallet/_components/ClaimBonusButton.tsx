// "use client";

// import { useState, useTransition } from "react";

// import { claimBonus } from "@/actions/claim";
// import { messageFor } from "@/lib/errors";
// import type { Role } from "@/lib/types";

// export function ClaimBonusButton({ role, isClient }: { role: Role; isClient: boolean }) {
//   const [error, setError] = useState<string | null>(null);
//   const [pending, startTransition] = useTransition();

//   function handleClaim() {
//     setError(null);
//     startTransition(async () => {
//       const res = await claimBonus();
//       if (!res.ok) {
//         setError(messageFor("ledger.claim", res.error.code));
//       }
//       // On success, revalidatePath in the action re-renders the page;
//       // the button disappears because balance > 0.
//     });
//   }

//   const amount = role === "client" ? "1000" : "100";

//   return (
//     <div className="flex flex-col items-center gap-3">
//       <span
//         className={`text-[11px] font-bold uppercase tracking-widest ${isClient ? "text-zinc-500" : "text-zinc-400"}`}
//       >
//         Welcome Bonus
//       </span>
//       <button
//         type="button"
//         onClick={handleClaim}
//         disabled={pending}
//         className={`rounded-full px-8 py-3 text-sm font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isClient ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800"}`}
//       >
//         {pending ? "Claiming…" : `Claim $${amount}`}
//       </button>
//       {error && <p className="text-xs text-red-400">{error}</p>}
//     </div>
//   );
// }
