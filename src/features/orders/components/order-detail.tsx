"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatusTimeline } from "@/components/shared/order-status-timeline";
import { StatusPill } from "@/components/shared/status-pill";
import { useLeaveReviewMutation, useOrderQuery, useOrderStatusMutation, useRaiseDisputeMutation } from "@/features/orders/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/status-labels";
import { cn } from "@/lib/utils";

const SUPPLIER_NEXT_ACTION: Partial<Record<string, { action: "mark_in_production" | "mark_ready_to_ship" | "mark_shipped"; label: string }>> = {
  CONFIRMED: { action: "mark_in_production", label: "بدء الإنتاج" },
  IN_PRODUCTION: { action: "mark_ready_to_ship", label: "جاهز للشحن" },
  READY_TO_SHIP: { action: "mark_shipped", label: "تم الشحن" },
};

export function OrderDetail({ orderId }: { orderId: string }) {
  const { data: session } = useSession();
  const { data: order, isLoading } = useOrderQuery(orderId);
  const statusMutation = useOrderStatusMutation(orderId);
  const reviewMutation = useLeaveReviewMutation(orderId);
  const disputeMutation = useRaiseDisputeMutation(orderId);

  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [disputeReason, setDisputeReason] = React.useState("");
  const [disputeOpen, setDisputeOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const isSupplier = session?.user.organization?.type === "SUPPLIER";

  if (isLoading || !order) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const meta = ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META];

  async function runStatusAction(action: "mark_in_production" | "mark_ready_to_ship" | "mark_shipped" | "confirm_delivery" | "cancel") {
    try {
      await statusMutation.mutateAsync({ action });
      toast.success("تم تحديث حالة الطلب");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث الطلب");
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await reviewMutation.mutateAsync({ rating, comment });
      toast.success("شكرًا لتقييمك");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال التقييم");
    }
  }

  async function handleDisputeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disputeReason.trim().length < 10) {
      toast.error("يرجى كتابة سبب أوضح للنزاع");
      return;
    }
    try {
      await disputeMutation.mutateAsync({ reason: disputeReason });
      toast.success("تم فتح النزاع، سيتواصل فريق الدعم معك");
      setDisputeOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر فتح النزاع");
    }
  }

  const supplierAction = isSupplier ? SUPPLIER_NEXT_ACTION[order.status] : undefined;
  const canConfirmDelivery = !isSupplier && order.status === "SHIPPED";
  const canCancel = order.status === "CONFIRMED";
  const canReview = !isSupplier && order.status === "DELIVERED" && !order.review;
  const canDispute = !["CANCELLED", "COMPLETED", "DISPUTED"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {isSupplier ? order.merchant.legalNameAr : order.supplier.legalNameAr}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <StatusPill labelAr={meta.labelAr} variant={meta.variant} />
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <OrderStatusTimeline status={order.status} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تفاصيل الطلب</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-foreground">
                {item.variant.product.titleAr}
                {item.variant.color ? ` — ${item.variant.color}` : ""}
                {item.variant.size ? ` / ${item.variant.size}` : ""}
              </span>
              <span className="text-muted-foreground">
                {item.qty} × {formatMoney(item.unitPriceMinor)} = {formatMoney(item.subtotalMinor)}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-semibold text-foreground">
            <span>الإجمالي</span>
            <span>{formatMoney(order.totalAmountMinor, order.currency)}</span>
          </div>
        </CardContent>
      </Card>

      {(supplierAction || canConfirmDelivery || canCancel || canDispute) && order.status !== "DISPUTED" ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>الإجراءات</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {supplierAction ? (
              <Button onClick={() => runStatusAction(supplierAction.action)} loading={statusMutation.isPending}>
                {supplierAction.label}
              </Button>
            ) : null}
            {canConfirmDelivery ? (
              <Button onClick={() => runStatusAction("confirm_delivery")} loading={statusMutation.isPending}>
                تأكيد الاستلام
              </Button>
            ) : null}
            {canCancel ? (
              <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">إلغاء الطلب</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>تأكيد إلغاء الطلب</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد؟</p>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setCancelOpen(false)}>
                      تراجع
                    </Button>
                    <Button
                      variant="destructive"
                      loading={statusMutation.isPending}
                      onClick={async () => {
                        await runStatusAction("cancel");
                        setCancelOpen(false);
                      }}
                    >
                      تأكيد الإلغاء
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
            {canDispute ? (
              <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">فتح نزاع</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>فتح نزاع بخصوص هذا الطلب</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDisputeSubmit} className="flex flex-col gap-3">
                    <Textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="اشرح المشكلة بالتفصيل..."
                      rows={4}
                    />
                    <DialogFooter>
                      <Button type="submit" variant="destructive" loading={disputeMutation.isPending}>
                        إرسال
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {order.review ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>تقييمك</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("size-4", i < order.review!.rating ? "fill-primary text-primary" : "text-muted")} />
              ))}
            </div>
            {order.review.comment ? <p className="text-muted-foreground">{order.review.comment}</p> : null}
          </CardContent>
        </Card>
      ) : canReview ? (
        <Card>
          <CardHeader>
            <CardTitle>إضافة تقييم</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} نجوم`}>
                    <Star className={cn("size-6", i < rating ? "fill-primary text-primary" : "text-muted")} />
                  </button>
                ))}
              </div>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقًا (اختياري)" rows={3} />
              <Button type="submit" loading={reviewMutation.isPending} className="w-fit">
                إرسال التقييم
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
