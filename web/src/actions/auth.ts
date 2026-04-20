"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Authorization data is kept in cookies

export async function createAccount() {
  // const user = await getCurrentUser();
  // if (!user) {
  //   redirect("/login");
  // }
  const response = await fetch(`${process.env.IDENTITY_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // user,
    }),
  });

  //   revalidatePath("/dashboard");
}
