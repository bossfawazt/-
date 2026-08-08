import { db } from "@/lib/db";
import { PERMISSIONS, ROLE_PERMISSIONS, type PermissionKey, type RoleName } from "@/lib/rbac";
import type { SessionOrganization } from "@/types/next-auth";

/**
 * Loads the role/organization context for a user, to embed in the JWT
 * (src/lib/auth.ts `jwt` callback). A platform role always wins over an
 * organization membership — the two are mutually exclusive by design
 * (docs/ARCHITECTURE-touq.md #4: Admins are not part of a supplier/merchant org).
 */
export async function loadAuthContext(userId: string) {
  const [user, platformRoleAssignment, membership] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true, locale: true } }),
    db.platformRoleAssignment.findFirst({
      where: { userId },
      include: { role: true },
    }),
    db.organizationMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { role: true, organization: true },
    }),
  ]);

  const platformRole = (platformRoleAssignment?.role.name as RoleName | undefined) ?? null;

  const organization: SessionOrganization | null = membership
    ? {
        id: membership.organization.id,
        type: membership.organization.type,
        legalNameAr: membership.organization.legalNameAr,
        roleName: membership.role.name as RoleName,
        verificationStatus: membership.organization.verificationStatus,
        status: membership.organization.status,
      }
    : null;

  return {
    name: user?.name ?? "",
    email: user?.email ?? null,
    phone: user?.phone ?? "",
    locale: user?.locale ?? "ar",
    platformRole,
    organization,
  };
}

export interface AuthorizeContext {
  platformRole: RoleName | null;
  organization: SessionOrganization | null;
}

/** Resolves the effective permission set for a session's role context (docs/UIUX-touq.md #5). */
export function getPermissions(ctx: AuthorizeContext): PermissionKey[] {
  if (ctx.platformRole) return ROLE_PERMISSIONS[ctx.platformRole];
  if (ctx.organization) return ROLE_PERMISSIONS[ctx.organization.roleName];
  return [];
}

export function hasPermission(ctx: AuthorizeContext, permission: PermissionKey): boolean {
  return getPermissions(ctx).includes(permission);
}

/**
 * The single authorization primitive used everywhere: a resource action is
 * allowed if the actor has the platform-level permission, OR has the
 * organization-level permission AND owns the resource's organization
 * (docs/ARCHITECTURE-touq.md #5).
 */
export function canActOnOrganization(ctx: AuthorizeContext, organizationId: string, permission: PermissionKey): boolean {
  if (ctx.platformRole && hasPermission(ctx, permission)) return true;
  if (ctx.organization?.id === organizationId && hasPermission(ctx, permission)) return true;
  return false;
}

export { PERMISSIONS };
