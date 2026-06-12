import { NextRequest } from "next/server";
import { forwardToIdentity } from "@/lib/public-proxy";

// DELETE /api/v1/users/{user_id} — self-service account deletion (X-API-Key).
export function DELETE(req: NextRequest) {
  return forwardToIdentity(req);
}
