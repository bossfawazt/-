"use client";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { adminNav, merchantMobileNav, merchantNav, supplierMobileNav, supplierNav } from "@/config/site";
import type { SessionOrganization } from "@/types/next-auth";

interface DashboardShellProps {
  role: "admin" | "supplier" | "merchant";
  organization: SessionOrganization | null;
  children: React.ReactNode;
}

const ROLE_CONFIG = {
  admin: { items: adminNav, mobileItems: adminNav.slice(0, 5), variant: "dark" as const, title: "لوحة الإدارة" },
  supplier: { items: supplierNav, mobileItems: supplierMobileNav, variant: "dark" as const, title: "لوحة المورد" },
  merchant: { items: merchantNav, mobileItems: merchantMobileNav, variant: "light" as const, title: "لوحة التاجر" },
};

/** docs/UIUX-touq.md #B.3: the full authenticated app shell, adapting to the viewer's role. */
export function DashboardShell({ role, organization, children }: DashboardShellProps) {
  const config = ROLE_CONFIG[role];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        items={config.items}
        variant={config.variant}
        orgName={organization?.legalNameAr}
        verificationPending={organization?.verificationStatus === "PENDING"}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar title={config.title} />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <MobileBottomNav items={config.mobileItems} />
      </div>
    </div>
  );
}
