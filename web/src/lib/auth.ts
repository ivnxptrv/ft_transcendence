import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/* getCurrentUser is a utility function (reads auth state), not
  a server action (which handle mutations—create/update/delete). 
*/
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const user = cookieStore.get("jwt_token");
  if (!user) {
    redirect("/login");
  }
  return user;
}
