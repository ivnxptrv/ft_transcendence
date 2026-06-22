import { cache } from "react";

import { getLegend } from "@/actions/legend";
import { getUserProfile } from "@/lib/auth";
import { UserProfile } from "@/lib/types"

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
  const legend = profile.role === "insider" ? await getLegend(profile.id) : null;
  // Nudge only when semantic confirms the legend is absent. Clients (no legend)
  // and an unreachable semantic (legend.ok === false) both resolve to "no nudge"
  // — an outage must not flag an insider who may already have one.
  const hasLegend = !legend || !legend.ok ? true : legend.data !== null;
  return { ...profile, hasLegend };
});

// Post-auth landing target. A legend-less insider starts on /legend — the page
// they must visit before appearing in matches — everyone else on the dashboard.
// This is a one-time landing decision, not a guard: once there they navigate
// freely (the nav dot keeps nudging until the legend is set). An outage resolves
// hasLegend to true, so it degrades to /dashboard rather than a forced detour.
export async function landingPath(): Promise<string> {
  const session = await getSession();
  return session.role === "insider" && !session.hasLegend ? "/legend" : "/dashboard";
}

// Display name: first name plus last name when present. first_name is always
// set (required at signup); last_name is optional.
export function displayName(u: {
  first_name: string | null;
  last_name: string | null;
}): string {
  return [u.first_name, u.last_name].filter(Boolean).join(" ");
}
