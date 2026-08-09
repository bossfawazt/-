"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/shared/rating-stars";
import { StatTile } from "@/components/shared/stat-tile";
import { useAdminReportsQuery } from "@/features/admin/hooks";
import { ORDER_STATUS_META } from "@/lib/status-labels";

/** docs/UIUX-touq.md #C.6: Reports — RFQ→Order conversion, order status breakdown, top attributes, supplier leaderboard. */
export function ReportsClient() {
  const { data, isLoading } = useAdminReportsQuery();

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const maxAttrCount = Math.max(1, ...data.topAttributeValues.map((v) => v.count));
  const maxStatusCount = Math.max(1, ...data.orderStatusBreakdown.map((v) => v.count));

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">التقارير</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="إجمالي طلبات الشراء" value={data.rfqTotal} />
        <StatTile label="إجمالي الطلبات" value={data.orderTotal} />
        <StatTile label="نسبة التحويل" value={`${data.conversionPct}%`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>حالات الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!data.orderStatusBreakdown.length ? (
              <EmptyState icon={BarChart3} title="لا توجد طلبات بعد" />
            ) : (
              data.orderStatusBreakdown.map((row) => (
                <div key={row.status} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 text-muted-foreground">{ORDER_STATUS_META[row.status]?.labelAr ?? row.status}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(row.count / maxStatusCount) * 100}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-end font-medium text-foreground">{row.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأكثر طلبًا (خصائص المنتجات)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!data.topAttributeValues.length ? (
              <EmptyState icon={BarChart3} title="لا توجد بيانات كافية بعد" />
            ) : (
              data.topAttributeValues.map((row, i) => (
                <div key={`${row.attributeLabelAr}-${row.valueAr}-${i}`} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 truncate text-muted-foreground">
                    {row.attributeLabelAr}: {row.valueAr}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(row.count / maxAttrCount) * 100}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-end font-medium text-foreground">{row.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>الموردون الأعلى تقييمًا</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!data.supplierLeaderboard.length ? (
            <EmptyState icon={BarChart3} title="لا يوجد موردون بعد" />
          ) : (
            data.supplierLeaderboard.map((supplier, i) => (
              <div key={supplier.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="text-muted-foreground">#{i + 1}</span> {supplier.legalNameAr}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{supplier.completedOrders} طلب مكتمل</span>
                  {supplier.ratingCount > 0 ? <RatingStars rating={supplier.ratingAvg} count={supplier.ratingCount} /> : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
