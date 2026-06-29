import type { Role } from "@/lib/types";

import ClientNav from "./ClientNav";
import InsiderNav from "./InsiderNav";

// Picks the role's nav and feeds the insider legend nudge. Centralizes the
// choice so pages don't each re-derive it.
export default function AppNav({ role, hasLegend }: { role: Role; hasLegend: boolean }) {
  return role === "client" ? <ClientNav /> : <InsiderNav hasLegend={hasLegend} />;
}
