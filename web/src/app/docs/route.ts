import { NextRequest } from "next/server";
import { forwardToIdentity } from "@/lib/public-proxy";

// GET /docs — serve identity's Swagger UI through the public door. The HTML
// references /api/v1/openapi.json (also proxied here), so the spec resolves
// against this origin.
export function GET(req: NextRequest) {
  return forwardToIdentity(req);
}
