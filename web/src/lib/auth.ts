import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Role } from "@/lib/types";
import {
  ACCESS_COOKIE,
  IDENTITY_URL,
  getAuthConfig,
  verifyAccessToken,
} from "@/lib/auth-shared";

export { verifyAccessToken };

export type SessionUser = {
  userId: string;
  role: Role;
};

export type UserProfile = {
  id: string;
  email: string;
  role: Role;
  first_name: string | null;
  last_name: string | null;
};

export async function getUserProfile(): Promise<UserProfile> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE);
  if (!token) {
    redirect("/login");
  }
  const config = await getAuthConfig();
  const res = await fetch(`${IDENTITY_URL}${config.me_endpoint}`, {
    headers: { authorization: `Bearer ${token.value}` },
    cache: "no-store",
  });
  if (!res.ok) {
    redirect("/login");
  }
  return (await res.json()) as UserProfile;
}

export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE);
  if (!token) {
    redirect("/login");
  }
  try {
    const payload = await verifyAccessToken(token.value);
    if (
      typeof payload.sub === "string" &&
      (payload.role === "client" || payload.role === "insider")
    ) {
      return {
        userId: payload.sub,
        role: payload.role,
      };
    }
  } catch {
    // fall through to redirect
  }
  redirect("/login");
}
