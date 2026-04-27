import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  await getCurrentUser();
  redirect("/dashboard");
}
