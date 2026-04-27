"use server";

// import { getInsightsForOrder } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";
// import { getCurrentUser } from "@/actions/auth";

export async function submitNewOrder(title: string, text: string) {
  // const user = await getCurrentUser();

  const response = await fetch(`${process.env.INTERACTION_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      text,
    }),
  });

  revalidatePath("/orders");
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
