"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { useOrdersQuery } from "@/features/orders/hooks";
import { formatMoney, formatRelativeTime } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/status-labels";

interface OrderRow {
  id: string;
  status: keyof typeof ORDER_STATUS_META;
  totalAmountMinor: number;
  currency: string;
  createdAt: string;
  merchant: { legalNameAr: string };
  supplier: { legalNameAr: string };
  items: { qty: number; variant: { product: { titleAr: string } } }[];
}

/** docs/UIUX-touq.md #C.9: shared order list for both merchant and supplier "Orders" screens. */
export function OrderList() {
  const { data: session } = useSession();
  const { data: orders, isLoading } = useOrdersQuery();
  const isSupplier = session?.user.organization?.type === "SUPPLIER";
  const basePath = isSupplier ? "/supplier/orders" : "/merchant/orders";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const list = (orders as OrderRow[] | undefined) ?? [];

  if (!list.length) {
    return (
      <div className="p-6">
        <EmptyState icon={ShoppingBag} title="لا توجد طلبات بعد" description="ستظهر الطلبات هنا بعد قبول عرض سعر." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">الطلبات</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isSupplier ? "التاجر" : "المورد"}</TableHead>
            <TableHead>المنتج</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التاريخ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((order) => {
            const meta = ORDER_STATUS_META[order.status];
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`${basePath}/${order.id}`} className="block font-medium text-foreground hover:text-primary">
                    {isSupplier ? order.merchant.legalNameAr : order.supplier.legalNameAr}
                  </Link>
                </TableCell>
                <TableCell>{order.items[0]?.variant.product.titleAr ?? "—"}</TableCell>
                <TableCell>{formatMoney(order.totalAmountMinor, order.currency)}</TableCell>
                <TableCell>
                  <StatusPill labelAr={meta.labelAr} variant={meta.variant} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatRelativeTime(order.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
