import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { hasPermission, type AuthorizeContext } from "@/lib/session";
import type { PermissionKey } from "@/lib/rbac";

/**
 * Shared guard for /api/admin/* routes. Pass "any" for read-only views any
 * platform admin should see (Overview, list/detail queues); pass a specific
 * PermissionKey to gate a mutating action to the roles the RBAC matrix
 * (docs/UIUX-touq.md #5) grants it to.
 */
export async function requireAdmin(permission: PermissionKey | "any") {
  const session = await auth();
  if (!session?.user.platformRole) {
    return { error: apiError("forbidden", "هذا الإجراء متاح لفريق الإدارة فقط", 403) } as const;
  }
  if (permission !== "any") {
    const ctx: AuthorizeContext = { platformRole: session.user.platformRole, organization: session.user.organization };
    if (!hasPermission(ctx, permission)) {
      return { error: apiError("forbidden", "لا تملك الصلاحية الكافية لتنفيذ هذا الإجراء", 403) } as const;
    }
  }
  return { userId: session.user.id } as const;
}
