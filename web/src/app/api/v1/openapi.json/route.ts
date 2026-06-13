import { NextRequest } from "next/server";
import { forwardToIdentity } from "@/lib/public-proxy";

// GET /api/v1/openapi.json — the OpenAPI spec backing /docs, proxied from
// identity so it's reachable from the public origin.
export function GET(req: NextRequest) {
  return forwardToIdentity(req);
}
