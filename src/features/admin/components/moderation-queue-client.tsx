"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Boxes, ImageOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ReasonDialog } from "@/features/admin/components/reason-dialog";
import { useDeleteProductMutation, useModerateProductMutation, useModerationQueueQuery } from "@/features/admin/hooks";
import { formatDate } from "@/lib/format";

/** docs/UIUX-touq.md #C.6: Listings Moderation — approve/reject pending-review products, plus admin delete. */
export function ModerationQueueClient() {
  const { data: queue, isLoading } = useModerationQueueQuery();
  const moderate = useModerateProductMutation();
  const deleteProduct = useDeleteProductMutation();
  const [rejectTarget, setRejectTarget] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  async function handleApprove(productId: string) {
    try {
      await moderate.mutateAsync({ productId, action: "approve" });
      toast.success("تمت الموافقة على المنتج ونشره");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تنفيذ الإجراء");
    }
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) return;
    try {
      await moderate.mutateAsync({ productId: rejectTarget, action: "reject", reason });
      toast.success("تم رفض المنتج");
      setRejectTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تنفيذ الإجراء");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget);
      toast.success("تم حذف المنتج نهائيًا");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف المنتج");
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">مراجعة المنتجات</h1>

      {!queue?.length ? (
        <EmptyState icon={Boxes} title="لا توجد منتجات بانتظار المراجعة" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queue.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.titleAr} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-8" />
                  </div>
                )}
              </div>
              <CardContent className="flex flex-col gap-2 p-4">
                <h2 className="font-medium text-foreground">{product.titleAr}</h2>
                <p className="text-xs text-muted-foreground">
                  {product.supplierName} · {product.categoryName}
                </p>
                <p className="text-xs text-muted-foreground">أُرسل للمراجعة {formatDate(product.submittedAt)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleApprove(product.id)} loading={moderate.isPending}>
                    موافقة
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => setRejectTarget(product.id)}>
                    رفض
                  </Button>
                  <Button
                    size="icon"
                    variant="icon"
                    aria-label="حذف المنتج"
                    onClick={() => setDeleteTarget(product.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReasonDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="رفض المنتج"
        onConfirm={handleReject}
        isPending={moderate.isPending}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المنتج نهائيًا</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">لا يمكن التراجع عن هذا الإجراء. سيتم حذف المنتج وكل بياناته نهائيًا.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              تراجع
            </Button>
            <Button variant="destructive" loading={deleteProduct.isPending} onClick={handleDelete}>
              حذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
