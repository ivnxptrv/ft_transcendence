import { NextRequest } from "next/server";
import { forwardToIdentity } from "@/lib/public-proxy";

// GET /api/v1/insights/{insight_id} — read one insight (X-API-Key).
export function GET(req: NextRequest) {
  return forwardToIdentity(req);
}
