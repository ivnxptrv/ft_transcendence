"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";
import { toCamelCase } from "@/lib/utils";
import type { Order, InsightCard } from "@/lib/types";

export async function submitNewOrder(
  title: string,
  text: string,
  idempotencyKey?: string,
): Promise<Result<unknown>> {
  const { userId } = await getCurrentUser();
  const res = await request(`${process.env.INTERACTION_URL}/api/v1/orders`, {
    service: "interaction",
    method: "POST",
    body: { client_id: userId, title, text },
    // Re-clicks of the same compose session carry the same key, so a write that
    // timed out client-side but committed server-side won't create a duplicate.
    idempotencyKey,
  });
  if (res.ok) revalidatePath("/orders");
  return res;
}

export async function getOrders(params?: {
  limit?: number;
  offset?: number;
}): Promise<Result<Order[]>> {
  const { userId } = await getCurrentUser();

  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/orders`);
  url.searchParams.set("client_id", userId);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));

  const res = await request<unknown>(url.toString(), { service: "interaction" });
  if (!res.ok) return res;
  const orders = (toCamelCase(res.data) as Order[]).toSorted((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return { ok: true, data: orders };
}

export async function getOrderById(orderId: string): Promise<Result<Order>> {
  const { userId } = await getCurrentUser();
  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/orders/${orderId}`);
  url.searchParams.set("client_id", userId);

  const res = await request<unknown>(url.toString(), { service: "interaction" });
  return res.ok ? { ok: true, data: toCamelCase(res.data) as Order } : res;
}

export async function getInsightsForOrder(
  orderId: string,
): Promise<Result<InsightCard[]>> {
  const res = await request<unknown>(
    `${process.env.INTERACTION_URL}/api/v1/insights?order_id=${orderId}`,
    { service: "interaction" },
  );
  return res.ok ? { ok: true, data: toCamelCase(res.data) as InsightCard[] } : res;
}
