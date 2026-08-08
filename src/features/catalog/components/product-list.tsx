"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, Package, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { useProductStatusMutation, useSupplierProductsQuery } from "@/features/catalog/hooks";
import { formatMoney } from "@/lib/format";
import { PRODUCT_STATUS_META } from "@/lib/status-labels";
import { toast } from "sonner";

const STATUS_ACTIONS: Record<string, { action: "submit_for_review" | "pause" | "resume" | "archive"; label: string }[]> = {
  DRAFT: [{ action: "submit_for_review", label: "إرسال للمراجعة" }],
  REJECTED: [{ action: "submit_for_review", label: "إعادة الإرسال للمراجعة" }],
  LIVE: [
    { action: "pause", label: "إيقاف مؤقت" },
    { action: "archive", label: "أرشفة" },
  ],
  PAUSED: [
    { action: "resume", label: "استئناف" },
    { action: "archive", label: "أرشفة" },
  ],
};

/** docs/UIUX-touq.md #C.8: supplier's catalog with lifecycle actions per docs/ARCHITECTURE-touq.md #10. */
export function ProductList() {
  const { data: products, isLoading } = useSupplierProductsQuery();
  const statusMutation = useProductStatusMutation();

  function handleAction(productId: string, action: "submit_for_review" | "pause" | "resume" | "archive") {
    statusMutation.mutate(
      { productId, action },
      {
        onError: (error) => toast.error(error.message),
        onSuccess: () => toast.success("تم تحديث حالة المنتج"),
      },
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">منتجاتي</h1>
        <Button asChild>
          <Link href="/supplier/products/new">
            <Plus className="size-4" /> إضافة منتج جديد
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !products?.length ? (
        <EmptyState
          icon={Package}
          title="لا توجد منتجات بعد"
          description="ابدأ بإضافة أول منتج لعرضه أمام التجار."
          action={
            <Button asChild>
              <Link href="/supplier/products/new">إضافة منتج جديد</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنتج</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>المتغيرات</TableHead>
              <TableHead>نطاق السعر</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const statusMeta = PRODUCT_STATUS_META[product.status];
              const actions = STATUS_ACTIONS[product.status] ?? [];
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageOff className="size-4" />
                          </div>
                        )}
                      </div>
                      <span className="line-clamp-2 max-w-56 font-medium text-foreground">{product.titleAr}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusPill labelAr={statusMeta.labelAr} variant={statusMeta.variant} />
                  </TableCell>
                  <TableCell>{product.variantCount}</TableCell>
                  <TableCell>
                    {product.priceMinMinor != null
                      ? product.priceMinMinor === product.priceMaxMinor
                        ? formatMoney(product.priceMinMinor)
                        : `${formatMoney(product.priceMinMinor)} – ${formatMoney(product.priceMaxMinor!)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild variant="icon" size="icon">
                        <Link href={`/supplier/products/${product.id}/edit`} aria-label="تعديل">
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      {actions.map((a) => (
                        <Button
                          key={a.action}
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleAction(product.id, a.action)}
                          disabled={statusMutation.isPending}
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
