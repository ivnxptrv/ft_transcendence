import { cookies } from "next/headers";
import type { Role } from "@/lib/types";

export async function getMockRole(): Promise<Role> {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("user-role")?.value as Role;
    if (role) {
      return role;
    }
    return "client";
  } catch (error) {
    console.error("Error getting mock role:", error);
  }
  return "client";
}

export const THEMES = {
  dark: {
    bg: "#0f0f0f",
    surface: "#161616",
    border: "#222",
    borderSubtle: "#1f1f1f",
    text: "#e4e4e4",
    muted: "#555",
    subtle: "#333",
    label: "#444",
    primary: "#e4e4e4",
    primaryText: "#0f0f0f",
    danger: "#c0392b",
    inputBg: "#1a1a1a",
    inputBorder: "#2a2a2a",
  },
  cream: {
    bg: "#faf9f7",
    surface: "#fff",
    border: "#e8e5e0",
    borderSubtle: "#ede9e3",
    text: "#2a2520",
    muted: "#9a9088",
    subtle: "#b0a898",
    label: "#b0a898",
    primary: "#2a2520",
    primaryText: "#faf9f7",
    danger: "#c0392b",
    inputBg: "#fff",
    inputBorder: "#e8e5e0",
  },
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export function getTheme(role: Role): Theme {
  return role === "client" ? THEMES.dark : THEMES.cream;
}
