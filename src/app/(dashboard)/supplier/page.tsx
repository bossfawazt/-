import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, MessageSquareText, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/shared/rating-stars";
import { StatTile } from "@/components/shared/stat-tile";
import { auth } from "@/lib/auth";
import { formatMinutes, formatRelativeTime } from "@/lib/format";
import { getSupplierDashboardStats } from "@/server/services/dashboard.service";

/** docs/UIUX-touq.md #C.5: Supplier Dashboard home. */
export default async function SupplierDashboardPage() {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") redirect("/login");

  const stats = await getSupplierDashboardStats(session.user.organization.id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">مرحباً بعودتك، {session.user.name}</h1>
        <p className="text-sm text-muted-foreground">{session.user.organization.legalNameAr}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="طلبات شراء جديدة" value={stats.newRfqCount} icon={MessageSquareText} emphasis={stats.newRfqCount > 0} />
        <StatTile label="عروض بانتظار الرد" value={stats.pendingQuoteCount} icon={Clock} />
        <StatTile label="طلبات نشطة" value={stats.activeOrderCount} icon={ShoppingBag} />
        <StatTile label="منتجات منشورة" value={stats.liveProductCount} icon={Package} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>أحدث طلبات الشراء</CardTitle>
            <Button asChild variant="tertiary" size="sm">
              <Link href="/supplier/rfqs">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!stats.recentRfqs.length ? (
              <EmptyState title="لا توجد طلبات شراء بعد" description="ستظهر طلبات الشراء الواردة من التجار هنا." />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {stats.recentRfqs.map((rfq) => (
                  <Link
                    key={rfq.id}
                    href="/supplier/rfqs"
                    className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{rfq.merchant.legalNameAr}</span>
                      <span className="text-muted-foreground">{rfq.product?.titleAr ?? "طلب عام"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(rfq.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأداء</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">التقييم</span>
              {stats.ratingCount > 0 ? (
                <RatingStars rating={stats.ratingAvg} count={stats.ratingCount} />
              ) : (
                <span className="text-muted-foreground">لا يوجد بعد</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">متوسط زمن الرد</span>
              <span className="font-medium text-foreground">
                {stats.responseTimeAvgMinutes ? formatMinutes(stats.responseTimeAvgMinutes) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">منتجات مسودة/قيد المراجعة</span>
              <span className="font-medium text-foreground">{stats.draftProductCount}</span>
            </div>
            <Button asChild className="mt-2">
              <Link href="/supplier/products/new">إضافة منتج جديد</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
