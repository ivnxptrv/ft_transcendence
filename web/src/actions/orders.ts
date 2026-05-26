"use server";

// import { getInsightsForOrder } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function submitNewOrder(title: string, text: string) {
  const { userId } = await getCurrentUser();

  const response = await fetch(`${process.env.INTERACTION_URL}/api/v1/orders?user_id=${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
  url.searchParams.set("user_id", userId);
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
    throw new Error("Failed to get orders");
  }

  return response.json();
}

export async function getInsightsForOrder(orderId: string) {
  const response = await fetch(`${process.env.INTERACTION_URL}/insights?orderId=${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
}
