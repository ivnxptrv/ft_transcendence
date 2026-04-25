import { logout } from "@/actions/auth";

export function SessionSection({ isClient }: { isClient: boolean }) {
  return (
    <>
      <p
        className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
      >
        Session
      </p>
      <div
        className={`rounded-3xl border overflow-hidden mb-8 ${isClient ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200/60 shadow-sm"}`}
      >
        <form action={logout}>
          <button
            type="submit"
            className={`w-full text-left p-5 flex items-center transition-colors cursor-pointer group ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
          >
            <span className={`text-[13px] font-semibold text-red-500`}>Sign out of Vekko</span>
          </button>
        </form>
      </div>
    </>
  );
}
