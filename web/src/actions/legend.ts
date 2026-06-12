"use server";

import { getCurrentUser } from "@/lib/auth";

export async function setLegend(text: string) {
  const { userId } = await getCurrentUser();

  const res = await fetch(`${process.env.SEMANTIC_URL}/api/v1/souls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      insider_id: userId,
      text,
    }),
  });

  if (!res.ok) 
    throw new Error("Failed to post legend")  
    
  return res.json();

}
