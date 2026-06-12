import { NextRequest } from "next/server";
import { forwardToIdentity } from "@/lib/public-proxy";

// POST /api/v1/insights — create an insight (X-API-Key).
export function POST(req: NextRequest) {
  return forwardToIdentity(req);
}
