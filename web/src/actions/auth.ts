"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { generateJwtToken } from "@/lib/auth";
import { Role } from "@/lib/types";

export async function login(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  // TODO: implement check with backend
  // const response = await fetch(`${process.env.IDENTITY_URL}/users/login`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     email,
  //     password,
  //   }),
  // });

  // if (!response.ok) {
  //   return await response.json();
  // }
  // const body = await response.json();
  // if (!body.id || (body.role !== "client" && body.role !== "insider")) {
  //   return { error: "Invalid login response" };
  // }
  const token = await generateJwtToken("user_123", "client");
  const cookieStore = await cookies();
  cookieStore.set("jwt_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/dashboard");
}

export async function signup(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const role = data.get("role") as string;
  if (role !== "client" && role !== "insider") {
    redirect("/signup");
  }

  // const response = await fetch(`${process.env.IDENTITY_URL}/users`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     email,
  //     password,
  //     firstName,
  //     lastName,
  //     role,
  //   }),
  // });

  // const response = await fetch(token);

  // if (!response.ok) {
  //   return await response.json();
  // }
  // const body = await response.json();
  // if (!body.id || (body.role !== "client" && body.role !== "insider")) {
  //   return { error: "Invalid signup response" };
  // }

  const token = await generateJwtToken("user_123", role);
  const cookieStore = await cookies();
  cookieStore.set("jwt_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("jwt_token");
  redirect("/login");
}
