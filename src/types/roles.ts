export const APP_ROLES = ["admin", "customer", "manufacturer", "technician", "support", "accountant"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "مدير",
  customer: "عميل",
  manufacturer: "مصنع",
  technician: "فني",
  support: "دعم العملاء",
  accountant: "محاسب",
};

/** أدوار لوحة الإدارة الداخلية */
export const BACKOFFICE_ROLES: readonly AppRole[] = ["admin", "support", "accountant"];

/** الصفحة الافتراضية بعد الدخول حسب الدور */
export function homePathForRole(role: AppRole | null | undefined): string {
  if (role && BACKOFFICE_ROLES.includes(role)) return "/admin";
  return "/account";
}
