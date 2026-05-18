import { cookies } from "next/headers";
import { redirect } from "next/navigation";
/* getCurrentUser is a utility function (reads auth state), not
  a server action (which handle mutations—create/update/delete). 
*/

export type SessionUser = {
  userId: string;
  role: "client" | "insider";
};

<<<<<<< HEAD
function identityUrl() {
  if (process.env.IDENTITY_URL && !process.env.IDENTITY_URL.includes("${")) {
    return process.env.IDENTITY_URL;
  }

  return `http://${process.env.IDENTITY_HOST ?? "localhost"}:${process.env.IDENTITY_PORT ?? "4010"}`;
}

const IDENTITY_URL = identityUrl();
const JWT_ISSUER = process.env.JWT_ISSUER ?? "identity";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "ft-transcendence";

// Fetched once and cached by jose; periodically refreshed in the background.
// Identity rotates keys via `kid`, so we never hardcode public material here.
const JWKS = createRemoteJWKSet(
  new URL(`${IDENTITY_URL}/api/v1/.well-known/jwks.json`),
);

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  return payload;
}

=======
>>>>>>> dev-vvoronts
export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt_token");
  if (!token) {
    redirect("/login");
  }
  try {
    const { payload } = await jwtVerify(token.value, secret);
    if (
      typeof payload.sub === "string" &&
      (payload.role === "client" || payload.role === "insider")
    ) {
      return {
        userId: payload.sub,
        role: payload.role,
      };
    }
  } catch {
    throw new Error("Invalid token");
  }
  redirect("/login");
}

// Until Identity Service is implemented, we use pre-defined JWT tokens.
// TODO: remove this when Identity Service is implemented!
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function generateJwtToken(userId: string, role: "client" | "insider") {
  const token = await new SignJWT({ role: role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return token;
}
