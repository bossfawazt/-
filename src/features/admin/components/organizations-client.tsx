"use client";

import * as React from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/shared/rating-stars";
import { StatusPill } from "@/components/shared/status-pill";
import {
  useAdminOrganizationDetailQuery,
  useAdminOrganizationsQuery,
  useSetOrganizationStatusMutation,
} from "@/features/admin/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS_META, VERIFICATION_STATUS_META } from "@/lib/status-labels";

const ORG_STATUS_META: Record<string, { labelAr: string; variant: "success" | "warning" | "destructive" }> = {
  ACTIVE: { labelAr: "نشط", variant: "success" },
  PENDING: { labelAr: "قيد المراجعة", variant: "warning" },
  SUSPENDED: { labelAr: "معلّق", variant: "destructive" },
};

/** docs/UIUX-touq.md #C.6: Users & Organizations — searchable table + detail drawer with Suspend/Reinstate. */
export function OrganizationsClient() {
  const [type, setType] = React.useState<"ALL" | "SUPPLIER" | "MERCHANT">("ALL");
  const [searchInput, setSearchInput] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const { data, isLoading } = useAdminOrganizationsQuery({ type: type === "ALL" ? undefined : type, q: query || undefined });
  const { data: detail, isLoading: detailLoading } = useAdminOrganizationDetailQuery(selectedId ?? undefined);
  const setStatus = useSetOrganizationStatusMutation();

  async function handleStatusAction(organizationId: string, action: "suspend" | "reinstate") {
    try {
      await setStatus.mutateAsync({ organizationId, action });
      toast.success(action === "suspend" ? "تم تعليق الحساب" : "تم إعادة تفعيل الحساب");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تنفيذ الإجراء");
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">المستخدمون والمنشآت</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
          <TabsList>
            <TabsTrigger value="ALL">الكل</TabsTrigger>
            <TabsTrigger value="SUPPLIER">الموردون</TabsTrigger>
            <TabsTrigger value="MERCHANT">التجار</TabsTrigger>
          </TabsList>
        </Tabs>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(searchInput);
          }}
          className="w-64"
        >
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="ابحث بالاسم..." />
        </form>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <EmptyState icon={Building2} title="لا توجد منشآت مطابقة" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنشأة</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>التوثيق</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التقييم</TableHead>
              <TableHead>تاريخ الانضمام</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((org) => {
              const vMeta = VERIFICATION_STATUS_META[org.verificationStatus];
              const sMeta = ORG_STATUS_META[org.status];
              return (
                <TableRow key={org.id} className="cursor-pointer" onClick={() => setSelectedId(org.id)}>
                  <TableCell className="font-medium text-foreground">{org.legalNameAr}</TableCell>
                  <TableCell>{org.type === "SUPPLIER" ? "مورد" : "تاجر"}</TableCell>
                  <TableCell className="text-muted-foreground">{org.city ?? "—"}</TableCell>
                  <TableCell>
                    <StatusPill labelAr={vMeta.labelAr} variant={vMeta.variant} />
                  </TableCell>
                  <TableCell>
                    <StatusPill labelAr={sMeta.labelAr} variant={sMeta.variant} />
                  </TableCell>
                  <TableCell>{org.ratingCount > 0 ? <RatingStars rating={org.ratingAvg} count={org.ratingCount} /> : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(org.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="end" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.legalNameAr ?? "تفاصيل المنشأة"}</SheetTitle>
          </SheetHeader>

          {detailLoading || !detail ? (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{detail.type === "SUPPLIER" ? "مورد" : "تاجر"}</Badge>
                <StatusPill labelAr={VERIFICATION_STATUS_META[detail.verificationStatus].labelAr} variant={VERIFICATION_STATUS_META[detail.verificationStatus].variant} />
                <StatusPill labelAr={ORG_STATUS_META[detail.status].labelAr} variant={ORG_STATUS_META[detail.status].variant} />
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">المدينة</dt>
                  <dd className="text-foreground">{detail.city ?? detail.regionNameAr ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">تاريخ الانضمام</dt>
                  <dd className="text-foreground">{formatDate(detail.createdAt)}</dd>
                </div>
                {detail.crNumber ? (
                  <div>
                    <dt className="text-muted-foreground">السجل التجاري</dt>
                    <dd dir="ltr" className="text-end text-foreground">{detail.crNumber}</dd>
                  </div>
                ) : null}
                {detail.maroofId ? (
                  <div>
                    <dt className="text-muted-foreground">معروف</dt>
                    <dd className="text-foreground">{detail.maroofId}</dd>
                  </div>
                ) : null}
              </dl>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">الأعضاء</h3>
                <div className="flex flex-col gap-2">
                  {detail.members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                      <span className="text-foreground">{member.name}</span>
                      <span dir="ltr" className="text-xs text-muted-foreground">{member.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">آخر الطلبات</h3>
                {!detail.recentOrders.length ? (
                  <p className="text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {detail.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                        <StatusPill labelAr={ORDER_STATUS_META[order.status].labelAr} variant={ORDER_STATUS_META[order.status].variant} />
                        <span className="text-foreground">{formatMoney(order.totalAmountMinor, order.currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {detail.status === "SUSPENDED" ? (
                <Button onClick={() => handleStatusAction(detail.id, "reinstate")} loading={setStatus.isPending}>
                  إعادة تفعيل الحساب
                </Button>
              ) : (
                <Button variant="destructive" onClick={() => handleStatusAction(detail.id, "suspend")} loading={setStatus.isPending}>
                  تعليق الحساب
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
