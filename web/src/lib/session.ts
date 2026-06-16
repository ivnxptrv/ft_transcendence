import { cache } from "react";

import { getLegend } from "@/actions/legend";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/types";

export type Session = {
  userId: string;
  role: Role;
  // Insiders only; always true for clients (the nudge is insider-specific).
  hasLegend: boolean;
};

// Memoized per request (React `cache`): the page, the nav, and any component can
// call this and the underlying reads run once per navigation — no per-page
// duplication. "Has legend" stays sourced from semantic (single source of
// truth), so no token claim and no drift.
export const getSession = cache(async (): Promise<Session> => {
  const { userId, role } = await getCurrentUser();
  const hasLegend =
    role === "insider" ? (await getLegend(userId)) !== null : true;
  return { userId, role, hasLegend };
});
