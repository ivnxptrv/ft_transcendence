"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { toCamelCase } from "@/lib/utils";
import type { Order } from "@/lib/types";

export async function submitNewOrder(title: string, text: string) {
  const { userId } = await getCurrentUser();

  const response = await fetch(`${process.env.INTERACTION_URL}/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: userId,
      title,
      text,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to submit new order");
  }

  revalidatePath("/orders");
}

export async function getOrders(params?: { limit?: number; offset?: number }) {
  const { userId } = await getCurrentUser();

  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/orders`);
  url.searchParams.set("client_id", userId);
  if (params?.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params?.offset) {
    url.searchParams.set("offset", params.offset.toString());
  }
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to get orders list");
  }

  const data = await response.json();

  const orders: Order[] = toCamelCase(data).toSorted(
    (a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt)
  );

  return orders;
}

export async function getOrderById(orderId: string) {
  const { userId } = await getCurrentUser();
  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/orders/${orderId}`);

  url.searchParams.set("client_id", userId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to get order");
  }

  const data = await response.json();

  return toCamelCase(data);
}

export async function getInsightsForOrder(orderId: string) {
  const response = await fetch(
    `${process.env.INTERACTION_URL}/api/v1/insights?order_id=${orderId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get insights for order");
  }

  return response.json();
}
