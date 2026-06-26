import { setRequestLocale } from "next-intl/server";

import { listUsers } from "@/actions/admin";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { SectionError } from "@/app/_components/SectionError";
import { redirect } from "@/i18n/navigation";
import { AdminUsersTable } from "./_components/AdminUsersTable";

// Admin console — advanced permissions system (subject IV.2). Server-guarded:
// the proxy already keeps non-admins off /admin; this re-check is the page-level
// belt to the proxy's braces. identity's require_admin is the authoritative gate.
export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const me = await getCurrentUser();
  if (me.role !== "admin") redirect({ href: "/dashboard", locale });

  const users = await listUsers({ limit: 100 });

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 h-14 flex items-center justify-between">
        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
          Admin Console
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </nav>

      <main className="px-6 pt-12 pb-24 max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Create accounts, edit profiles, reassign roles, and remove users.
          </p>
        </header>

        {users.ok ? (
          <AdminUsersTable initialUsers={users.data} currentUserId={me.userId} />
        ) : (
          <SectionError code={users.error.code} op="identity.admin" tone="dark" />
        )}
      </main>
    </div>
  );
}
