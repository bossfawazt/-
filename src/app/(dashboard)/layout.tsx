import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Defense-in-depth auth re-check for every (dashboard) route
 * (docs/ARCHITECTURE-touq.md #9.4) — src/proxy.ts already redirects
 * unauthenticated requests, but Next.js's own guidance is not to rely on
 * Proxy alone (node_modules/next/dist/docs/.../proxy.md #execution-order).
 *
 * The app shell (docs/UIUX-touq.md #B.3) adapts to the *viewer's* role
 * rather than the route: a merchant or supplier visiting the shared
 * /settings or /notifications routes sees their own nav shell, not a
 * generic one — platform role wins over organization type, matching the
 * "platform role always wins" rule in src/lib/session.ts.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.platformRole
    ? "admin"
    : session.user.organization?.type === "SUPPLIER"
      ? "supplier"
      : "merchant";

  return (
    <DashboardShell role={role} organization={session.user.organization}>
      {children}
    </DashboardShell>
  );
}
