"use server";

import { getCurrentUser } from "./auth";

export async function setLegend(legend: string) {
  const userId = getCurrentUser();

  const res = await fetch(`${process.env.SEMANTIC_URL}/souls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      legend,
    }),
  });

  if (!res.ok) return res.json();

  return res.json();
}
