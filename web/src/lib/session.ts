import { cache } from "react";

import { getLegend } from "@/actions/legend";
import { getUserProfile, type UserProfile } from "@/lib/auth";

// The current user's profile (from identity) plus derived session state.
export type Session = UserProfile & {
  // Insiders only; always true for clients (the nudge is insider-specific).
  hasLegend: boolean;
};

// Memoized per request (React `cache`): the page, the nav, and any component can
// call this and the underlying reads run once per navigation — no per-page
// duplication. Single source for "who is the current user" + "has legend".
export const getSession = cache(async (): Promise<Session> => {
  const profile = await getUserProfile();
  const hasLegend =
    profile.role === "insider" ? (await getLegend(profile.id)) !== null : true;
  return { ...profile, hasLegend };
});

// Display name: first name plus last name when present. first_name is always
// set (required at signup); last_name is optional.
export function displayName(u: {
  first_name: string | null;
  last_name: string | null;
}): string {
  return [u.first_name, u.last_name].filter(Boolean).join(" ");
}
