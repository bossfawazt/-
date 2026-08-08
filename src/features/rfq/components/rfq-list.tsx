"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageSquareText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { useRfqsQuery } from "@/features/rfq/hooks";
import { formatRelativeTime } from "@/lib/format";
import { RFQ_STATUS_META } from "@/lib/status-labels";

interface RfqRow {
  id: string;
  status: keyof typeof RFQ_STATUS_META;
  requestedQty: number;
  targetPriceMinor: number | null;
  createdAt: string;
  merchant: { legalNameAr: string };
  supplier: { legalNameAr: string; verificationStatus: string };
  product: { titleAr: string } | null;
  quotes: { status: string }[];
}

/** docs/UIUX-touq.md #C.9: shared RFQ list for both "My Requests" (merchant) and "RFQ Inbox" (supplier). */
export function RfqList() {
  const { data: session } = useSession();
  const { data: rfqs, isLoading } = useRfqsQuery();
  const isSupplier = session?.user.organization?.type === "SUPPLIER";
  const basePath = isSupplier ? "/supplier/rfqs" : "/merchant/requests";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const list = (rfqs as RfqRow[] | undefined) ?? [];

  if (!list.length) {
    return (
      <div className="p-6">
        <EmptyState
          icon={MessageSquareText}
          title={isSupplier ? "لا توجد طلبات شراء واردة بعد" : "لا توجد طلبات شراء بعد"}
          description={isSupplier ? "ستظهر طلبات الشراء من التجار هنا." : "أرسل طلب شراء من صفحة أي منتج في السوق."}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">{isSupplier ? "طلبات الشراء الواردة" : "طلبات الشراء"}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isSupplier ? "التاجر" : "المورد"}</TableHead>
            <TableHead>المنتج</TableHead>
            <TableHead>الكمية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التاريخ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((rfq) => {
            const meta = RFQ_STATUS_META[rfq.status];
            return (
              <TableRow key={rfq.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`${basePath}/${rfq.id}`} className="block font-medium text-foreground hover:text-primary">
                    {isSupplier ? rfq.merchant.legalNameAr : rfq.supplier.legalNameAr}
                  </Link>
                </TableCell>
                <TableCell>{rfq.product?.titleAr ?? "طلب عام"}</TableCell>
                <TableCell>{rfq.requestedQty}</TableCell>
                <TableCell>
                  <StatusPill labelAr={meta.labelAr} variant={meta.variant} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatRelativeTime(rfq.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
