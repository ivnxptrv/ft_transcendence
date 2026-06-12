import { NextRequest } from "next/server";
import { forwardToIdentity } from "@/lib/public-proxy";

// GET /api/v1/orders/{order_id} — read one of your orders (X-API-Key).
export function GET(req: NextRequest) {
  return forwardToIdentity(req);
}
