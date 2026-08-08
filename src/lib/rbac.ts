/**
 * Single source of truth for roles and permissions.
 * Mirrors the RBAC matrix in docs/UIUX-touq.md #5 and the role list in #4,
 * trimmed to what the MVP scope (docs/ROADMAP-touq.md M0-M6) needs —
 * billing/integration permissions are added when those features ship.
 *
 * Consumed by prisma/seed.ts (to create Role/Permission rows) and by
 * src/lib/session.ts (to authorize requests against a session's role).
 */

export const PLATFORM_ROLES = {
  SUPER_ADMIN: "super_admin",
  OPS_ADMIN: "ops_admin",
} as const;

export const ORG_ROLES = {
  ORG_OWNER: "org_owner",
  ORG_STAFF: "org_staff",
} as const;

export const ROLES = { ...PLATFORM_ROLES, ...ORG_ROLES } as const;
export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  CATALOG_BROWSE: "catalog.browse",
  PRODUCT_WRITE: "product.write",
  PRODUCT_MODERATE: "product.moderate",
  RFQ_CREATE: "rfq.create",
  RFQ_RESPOND: "rfq.respond",
  ORDER_VIEW: "order.view",
  ORDER_MANAGE_STATUS: "order.manage_status",
  REVIEW_WRITE: "review.write",
  ORG_VERIFY: "org.verify",
  ORG_MANAGE_STAFF: "org.manage_staff",
  DISPUTE_RESOLVE: "dispute.resolve",
  PLATFORM_CONFIG: "platform.config",
} as const;
export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** docs/UIUX-touq.md #5 RBAC matrix, encoded. */
export const ROLE_PERMISSIONS: Record<RoleName, PermissionKey[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.OPS_ADMIN]: [
    PERMISSIONS.CATALOG_BROWSE,
    PERMISSIONS.PRODUCT_MODERATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_MANAGE_STATUS,
    PERMISSIONS.ORG_VERIFY,
    PERMISSIONS.DISPUTE_RESOLVE,
  ],
  [ROLES.ORG_OWNER]: [
    PERMISSIONS.CATALOG_BROWSE,
    PERMISSIONS.PRODUCT_WRITE,
    PERMISSIONS.RFQ_CREATE,
    PERMISSIONS.RFQ_RESPOND,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_MANAGE_STATUS,
    PERMISSIONS.REVIEW_WRITE,
    PERMISSIONS.ORG_MANAGE_STAFF,
  ],
  [ROLES.ORG_STAFF]: [
    PERMISSIONS.CATALOG_BROWSE,
    PERMISSIONS.PRODUCT_WRITE,
    PERMISSIONS.RFQ_CREATE,
    PERMISSIONS.RFQ_RESPOND,
    PERMISSIONS.ORDER_VIEW,
  ],
};

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: "Full platform access: verification, moderation, disputes, and configuration.",
  [ROLES.OPS_ADMIN]: "Supplier/merchant verification, listing moderation, and dispute mediation.",
  [ROLES.ORG_OWNER]: "Full control of their own organization: catalog, RFQs, orders, staff.",
  [ROLES.ORG_STAFF]: "Scoped access within an organization (Enterprise multi-user accounts).",
};
