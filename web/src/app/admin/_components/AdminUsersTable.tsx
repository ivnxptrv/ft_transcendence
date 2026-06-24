"use client";

import { useState, useTransition } from "react";

import { createUser, deleteUser, setUserRole, updateUser } from "@/actions/admin";
import { messageFor, type ApiError } from "@/lib/errors";
import type { AdminUser, Role } from "@/lib/types";

const ROLES: Role[] = ["client", "insider", "admin"];

function fullName(u: AdminUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return name || "—";
}

// Role-change failures carry which data blocked the switch (see actions/admin).
function roleError(err: ApiError): string {
  if (err.code === "CONFLICT" && err.detail === "orders") {
    return "Can't switch role — this user has orders only a client can own. Remove them first.";
  }
  if (err.code === "CONFLICT" && err.detail === "legend") {
    return "Can't switch role — this user has a legend only an insider can own. Remove it first.";
  }
  return messageFor("identity.admin", err.code);
}

type Draft = { first_name: string; last_name: string };

export function AdminUsersTable({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ first_name: "", last_name: "" });
  // The row currently mutating — disables just that row's controls.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function startEdit(u: AdminUser) {
    setError(null);
    setEditingId(u.id);
    setDraft({ first_name: u.first_name ?? "", last_name: u.last_name ?? "" });
  }

  function handleSave(sub: string) {
    setError(null);
    setBusyId(sub);
    startTransition(async () => {
      const fields = {
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
      };
      const res = await updateUser(sub, fields);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === sub
              ? { ...u, first_name: fields.first_name || null, last_name: fields.last_name || null }
              : u,
          ),
        );
        setEditingId(null);
      } else {
        setError(messageFor("identity.admin", res.error.code));
      }
      setBusyId(null);
    });
  }

  function handleRoleChange(u: AdminUser, role: Role) {
    if (role === u.role) return;
    setError(null);
    setBusyId(u.id);
    startTransition(async () => {
      const res = await setUserRole(u.id, role);
      if (res.ok) {
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
      } else {
        setError(roleError(res.error));
      }
      setBusyId(null);
    });
  }

  function handleDelete(u: AdminUser) {
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    setError(null);
    setBusyId(u.id);
    startTransition(async () => {
      const res = await deleteUser(u.id);
      if (res.ok) {
        setUsers((prev) => prev.filter((x) => x.id !== u.id));
      } else {
        setError(messageFor("identity.admin", res.error.code));
      }
      setBusyId(null);
    });
  }

  function handleCreated(u: AdminUser) {
    setUsers((prev) => [...prev, u]);
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateUserForm onCreated={handleCreated} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="rounded-3xl border border-white/5 bg-zinc-900/40 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <span>User</span>
          <span>Role</span>
          <span className="text-right">Actions</span>
        </div>

        {users.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-600">No users.</p>
        ) : (
          <ul>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = busyId === u.id;
              const editing = editingId === u.id;

              if (editing) {
                return (
                  <li
                    key={u.id}
                    className="px-6 py-4 border-b border-white/5 last:border-0 flex flex-col gap-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={draft.first_name}
                        onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))}
                        placeholder="First name"
                        className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                      />
                      <input
                        value={draft.last_name}
                        onChange={(e) => setDraft((d) => ({ ...d, last_name: e.target.value }))}
                        placeholder="Last name"
                        className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="flex items-center gap-4 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={busy}
                        className="text-[10px] uppercase tracking-tighter font-bold text-zinc-500 underline underline-offset-4 disabled:opacity-40 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(u.id)}
                        disabled={busy || !draft.first_name.trim()}
                        className="text-[10px] uppercase tracking-tighter font-bold text-emerald-400 underline underline-offset-4 disabled:opacity-40 cursor-pointer"
                      >
                        {busy ? "…" : "Save"}
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={u.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 sm:gap-4 px-6 py-4 border-b border-white/5 last:border-0 items-center"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {u.email}
                      {isSelf && (
                        <span className="ml-2 text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                          you
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {fullName(u)}
                      {u.totp_enabled && <span className="ml-2 text-zinc-600">· 2FA</span>}
                    </p>
                  </div>

                  <div className="justify-self-start sm:justify-self-auto">
                    <select
                      value={u.role ?? ""}
                      onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                      disabled={isSelf || busy}
                      title={isSelf ? "You can't change your own role" : undefined}
                      className="bg-black border border-white/10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-200 focus:outline-none focus:border-white/30 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {u.role === null && <option value="">none</option>}
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-start sm:justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => startEdit(u)}
                      disabled={busy}
                      className="text-[10px] uppercase tracking-tighter font-bold text-zinc-300 underline underline-offset-4 disabled:opacity-30 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      disabled={isSelf || busy}
                      className="text-[10px] uppercase tracking-tighter font-bold text-red-500 underline underline-offset-4 disabled:opacity-30 disabled:no-underline cursor-pointer"
                      title={isSelf ? "You can't delete your own account" : undefined}
                    >
                      {busy ? "…" : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function CreateUserForm({ onCreated }: { onCreated: (u: AdminUser) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "client" as Role,
  });
  const [pending, startTransition] = useTransition();

  function reset() {
    setForm({ email: "", password: "", first_name: "", last_name: "", role: "client" });
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createUser({
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || undefined,
      });
      if (res.ok) {
        onCreated(res.data);
        reset();
        setOpen(false);
      } else {
        setError(messageFor("identity.admin", res.error.code));
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
      >
        + New user
      </button>
    );
  }

  const input =
    "bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30";

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 flex flex-col gap-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">New user</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          placeholder="First name"
          className={input}
        />
        <input
          value={form.last_name}
          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          placeholder="Last name"
          className={input}
        />
        <input
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="Email"
          type="email"
          className={input}
        />
        <input
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="Password"
          type="password"
          autoComplete="new-password"
          className={input}
        />
        <select
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
          className={`${input} cursor-pointer`}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex items-center gap-4 justify-end">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={pending}
          className="text-[10px] uppercase tracking-tighter font-bold text-zinc-500 underline underline-offset-4 disabled:opacity-40 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || !form.email.trim() || !form.password || !form.first_name.trim()}
          className="text-[10px] uppercase tracking-tighter font-bold text-emerald-400 underline underline-offset-4 disabled:opacity-40 cursor-pointer"
        >
          {pending ? "…" : "Create"}
        </button>
      </div>
    </div>
  );
}
