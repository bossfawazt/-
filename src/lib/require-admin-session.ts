import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Server-component guard for /admin/* pages — proxy.ts only checks "is authenticated", not role. */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user.platformRole) redirect("/");
  return session;
}
