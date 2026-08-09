"use client";

import { AlertTriangle, ClipboardCheck, FileText, Store, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatTile } from "@/components/shared/stat-tile";
import { useAdminOverviewQuery } from "@/features/admin/hooks";
import { formatRelativeTime } from "@/lib/format";

const ACTION_LABELS: Record<string, string> = {
  "organization.approve": "وثّق المنشأة",
  "organization.reject": "رفض توثيق المنشأة",
  "organization.suspend": "علّق حساب المنشأة",
  "organization.reinstate": "أعاد تفعيل حساب المنشأة",
  "product.approve": "وافق على المنتج",
  "product.reject": "رفض المنتج",
  "product.delete": "حذف المنتج",
  "dispute.resolved": "حلّ النزاع",
  "dispute.rejected": "رفض النزاع",
};

/** docs/UIUX-touq.md #C.6: Admin Overview — KPI tile row + recent activity audit feed. */
export function OverviewClient() {
  const { data, isLoading } = useAdminOverviewQuery();

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, activity } = data;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">نظرة عامة</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="الموردون" value={stats.totalSuppliers} icon={Store} />
        <StatTile label="التجار" value={stats.totalMerchants} icon={Users} />
        <StatTile label="طلبات توثيق معلّقة" value={stats.pendingVerifications} icon={ClipboardCheck} emphasis={stats.pendingVerifications > 0} />
        <StatTile label="نزاعات مفتوحة" value={stats.openDisputes} icon={AlertTriangle} emphasis={stats.openDisputes > 0} />
        <StatTile label="طلبات شراء هذا الشهر" value={stats.rfqVolumeMtd} icon={FileText} />
        <StatTile label="نسبة التحويل لطلب" value={`${stats.conversionPct}%`} icon={TrendingUp} hint="طلبات شراء ← طلبات" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>آخر الأنشطة</CardTitle>
        </CardHeader>
        <CardContent>
          {!activity.length ? (
            <EmptyState title="لا توجد أنشطة بعد" description="ستظهر هنا إجراءات فريق الإدارة أولًا بأول." />
          ) : (
            <div className="flex flex-col gap-3">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                  <span className="text-foreground">
                    <span className="font-medium">{item.actorName}</span> {ACTION_LABELS[item.action] ?? item.action}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
