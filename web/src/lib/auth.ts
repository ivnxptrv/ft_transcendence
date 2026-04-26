import { cookies } from "next/headers";
import { redirect } from "next/navigation";
/* getCurrentUser is a utility function (reads auth state), not
  a server action (which handle mutations—create/update/delete). 
*/

export type SessionUser = {
  userId: string;
  role: "client" | "insider";
};

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
