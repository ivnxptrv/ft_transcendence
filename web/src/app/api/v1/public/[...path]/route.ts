import { NextRequest } from "next/server";
import { forwardToIdentity } from "@/lib/public-proxy";

// Blanket proxy for the public API: every request under /api/v1/public/* is
// forwarded to identity verbatim. Web holds no per-route knowledge — identity
// owns the routes, key validation, and forwarding to target services. The
// /public prefix is the boundary: this can only reach identity's public
// router, never its internal (Bearer-authed) surface.

export function GET(req: NextRequest) {
  return forwardToIdentity(req);
}

export function POST(req: NextRequest) {
  return forwardToIdentity(req);
}

export function PUT(req: NextRequest) {
  return forwardToIdentity(req);
}

export function PATCH(req: NextRequest) {
  return forwardToIdentity(req);
}

export function DELETE(req: NextRequest) {
  return forwardToIdentity(req);
}
