"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLegend } from "@/actions/legend";
import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import { IDENTITY_URL } from "@/lib/auth-shared";
import type { Result } from "@/lib/errors";
import type { AdminUser, Role } from "@/lib/types";

// Admin user management (advanced permissions, subject IV.2). Each action
// re-checks the caller is an admin in-process (a clean redirect for non-admins),
// then forwards the admin's bearer token to identity, which independently
// enforces require_admin (the authoritative gate). The web check is
// defense-in-depth and the path to a friendly redirect.

const ADMIN_USERS = "/api/v1/admin/users";

async function assertAdmin(): Promise<void> {
  const me = await getCurrentUser();
  if (me.role !== "admin") redirect("/dashboard");
}

export async function listUsers(params?: {
  limit?: number;
  offset?: number;
}): Promise<Result<AdminUser[]>> {
  await assertAdmin();
  const url = new URL(`${IDENTITY_URL}${ADMIN_USERS}`);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));
  return request<AdminUser[]>(url.toString(), { service: "identity" });
}

export async function createUser(input: {
  email: string;
  password: string;
  role: Role;
  first_name: string;
  last_name?: string;
}): Promise<Result<AdminUser>> {
  await assertAdmin();
  const res = await request<AdminUser>(`${IDENTITY_URL}${ADMIN_USERS}`, {
    service: "identity",
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
      role: input.role,
      first_name: input.first_name,
      last_name: input.last_name ?? null,
    },
  });
  if (res.ok) revalidatePath("/[locale]/admin", "page");
  return res;
}

export async function updateUser(
  sub: string,
  fields: { first_name?: string; last_name?: string }
): Promise<Result<unknown>> {
  await assertAdmin();
  const res = await request(`${IDENTITY_URL}${ADMIN_USERS}/${sub}`, {
    service: "identity",
    method: "PUT",
    body: fields,
  });
  if (res.ok) revalidatePath("/[locale]/admin", "page");
  return res;
}

// Reassign a role — blocking a change that would strand role-specific data:
// a user with orders can only be a client; a user with a legend only an insider.
// That data lives in interaction/semantic, which the web BFF reads directly, so
// identity's setter stays peer-agnostic. The CONFLICT error carries which data
// blocked it (`detail`) so the UI can explain. If a peer can't be reached we
// fail safe and refuse the switch rather than risk orphaning data.
export async function setUserRole(sub: string, role: Role): Promise<Result<unknown>> {
  await assertAdmin();

  if (role !== "client") {
    const orders = await hasOrders(sub);
    if (!orders.ok) return orders;
    if (orders.data) {
      return { ok: false, error: { code: "CONFLICT", service: "web", detail: "orders" } };
    }
  }
  if (role !== "insider") {
    const legend = await getLegend(sub);
    if (!legend.ok) return legend;
    if (legend.data !== null) {
      return { ok: false, error: { code: "CONFLICT", service: "web", detail: "legend" } };
    }
  }

  const res = await request(`${IDENTITY_URL}${ADMIN_USERS}/${sub}/role`, {
    service: "identity",
    method: "PUT",
    body: { role },
  });
  if (res.ok) revalidatePath("/[locale]/admin", "page");
  return res;
}

export async function deleteUser(sub: string): Promise<Result<unknown>> {
  await assertAdmin();
  const res = await request(`${IDENTITY_URL}${ADMIN_USERS}/${sub}`, {
    service: "identity",
    method: "DELETE",
  });
  if (res.ok) revalidatePath("/[locale]/admin", "page");
  return res;
}

// Does this user have any orders? (Client-owned data in interaction.) Mirrors
// getOrders' interaction call, but for an arbitrary user instead of "me".
async function hasOrders(sub: string): Promise<Result<boolean>> {
  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/orders`);
  url.searchParams.set("client_id", sub);
  url.searchParams.set("limit", "1");
  const res = await request<unknown[]>(url.toString(), { service: "interaction" });
  if (!res.ok) return res;
  return { ok: true, data: res.data.length > 0 };
}
