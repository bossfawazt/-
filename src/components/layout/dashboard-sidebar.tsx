"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  items: NavItem[];
  variant: "light" | "dark";
  orgName?: string;
  verificationPending?: boolean;
}

/**
 * docs/UIUX-touq.md #B.3: persistent, role-scoped sidebar. Placed first in
 * DOM order inside a `flex` row so it lands on the reading-start edge —
 * right in Arabic/RTL (the default), automatically mirroring to the left
 * if the document direction ever switches to LTR — no direction-specific
 * CSS required beyond that ordering.
 *
 * `variant`: Merchant stays on the ivory surface; Supplier/Admin use the
 * deep-charcoal "workspace" tint (docs/UIUX-touq.md #A.2 role tinting).
 */
export function DashboardSidebar({ items, variant, orgName, verificationPending }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e lg:flex",
        isDark ? "border-sidebar-border bg-sidebar text-sidebar-foreground" : "border-border bg-card",
      )}
    >
      <div className={cn("flex h-16 items-center px-6 font-display text-xl font-bold", isDark ? "text-sidebar-foreground" : "text-foreground")}>
        <Link href="/">توق</Link>
      </div>

      {orgName ? (
        <div className={cn("mx-4 mb-2 truncate rounded-md px-3 py-2 text-sm font-medium", isDark ? "bg-sidebar-accent" : "bg-secondary")}>
          {orgName}
        </div>
      ) : null}

      {verificationPending ? (
        <Link
          href="/onboarding"
          className="mx-4 mb-2 flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-medium text-warning"
        >
          <ShieldCheck className="size-4 shrink-0" />
          أكمل التوثيق للظهور في نتائج البحث
        </Link>
      ) : null}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? isDark
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "bg-primary/10 text-primary"
                  : isDark
                    ? "text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
