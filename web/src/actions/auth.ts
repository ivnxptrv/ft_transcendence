"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Authorization data is kept in cookies

export async function login(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  // TODO: implement check with backend
  const response = await fetch(`${process.env.IDENTITY_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  if (!response.ok) return response.json();

  const cookieStore = await cookies();
  cookieStore.set("jwt_token", "mock-jwt");
  redirect("/dashboard");
}

export async function signup(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;

  // console.log(email, password, firstName, lastName);
  // return;

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
