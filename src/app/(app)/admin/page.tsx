import type { Metadata } from "next";
import { CalendarCheck, ClipboardCheck, FolderOpen, MessagesSquare, PackageCheck, Users } from "lucide-react";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { requireRole } from "@/lib/auth/session";
import { formatNumber } from "@/lib/format";
import { getAdminOverview } from "@/features/admin/overview";
import { BACKOFFICE_ROLES, ROLE_LABELS } from "@/types/roles";

export const metadata: Metadata = { title: "لوحة الإدارة" };

export default async function AdminHomePage() {
  // الصلاحية تُفرض في الخادم هنا، وفي قاعدة البيانات عبر RLS
  const profile = await requireRole(BACKOFFICE_ROLES, "/admin");
  const o = await getAdminOverview();

  const kpis = [
    { label: "إجمالي العملاء", value: o.customers, icon: Users },
    { label: "مشاريع جديدة (30 يوماً)", value: o.newProjects, icon: FolderOpen },
    { label: "الطلبات الحالية", value: o.activeOrders, icon: ClipboardCheck },
    { label: "الطلبات المكتملة", value: o.completedOrders, icon: PackageCheck },
    { label: "معاينات قادمة", value: o.upcomingAppointments, icon: CalendarCheck },
    { label: "شكاوى مفتوحة", value: o.openComplaints, icon: MessagesSquare },
    { label: "رسائل تواصل جديدة", value: o.newMessages, icon: MessagesSquare },
  ];

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">لوحة الإدارة — {ROLE_LABELS[profile.role]}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">نظرة عامة</h1>
          <p className="mt-1 text-sm text-muted-foreground">الأرقام مباشرة من قاعدة البيانات وحسب صلاحيات دورك.</p>
        </div>
        <SignOutButton />
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <k.icon className="size-5 text-walnut" aria-hidden />
            <p className="mt-3 text-2xl font-bold sm:text-3xl">{formatNumber(k.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{k.label}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
        أقسام الإدارة التفصيلية (العملاء، المصانع، الأسعار، المواعيد، العروض، العمولات، التقارير) تُضاف في المراحل 4–6
        وفق خطة التنفيذ.
      </p>
    </div>
  );
}
