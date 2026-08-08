import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Defense-in-depth auth re-check for every (dashboard) route
 * (docs/ARCHITECTURE-touq.md #9.4) — src/proxy.ts already redirects
 * unauthenticated requests, but Next.js's own guidance is not to rely on
 * Proxy alone (node_modules/next/dist/docs/.../proxy.md #execution-order).
 *
 * The visual app shell (sidebar/topbar, docs/UIUX-touq.md Part B.3) is
 * built in Phase 5 — this layout currently only enforces the auth boundary.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <>{children}</>;
}
