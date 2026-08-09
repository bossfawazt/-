"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { useAdminDisputesQuery, useResolveDisputeMutation } from "@/features/admin/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { DISPUTE_STATUS_META } from "@/lib/status-labels";

/** docs/UIUX-touq.md #C.6: Orders & Disputes — flagged orders, resolution actions. No escrow/payments exist yet, so resolution just closes the dispute and returns the order to Completed. */
export function DisputesClient() {
  const { data: disputes, isLoading } = useAdminDisputesQuery();
  const resolve = useResolveDisputeMutation();
  const [target, setTarget] = React.useState<{ id: string; resolution: "RESOLVED" | "REJECTED" } | null>(null);
  const [notes, setNotes] = React.useState("");

  async function handleResolve() {
    if (!target || notes.trim().length < 5) return;
    try {
      await resolve.mutateAsync({ disputeId: target.id, resolution: target.resolution, notes: notes.trim() });
      toast.success("تم تحديث حالة النزاع");
      setTarget(null);
      setNotes("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تنفيذ الإجراء");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">الطلبات والنزاعات</h1>

      {!disputes?.length ? (
        <EmptyState icon={AlertTriangle} title="لا توجد نزاعات مفتوحة حاليًا" />
      ) : (
        <div className="flex flex-col gap-4">
          {disputes.map((dispute) => {
            const meta = DISPUTE_STATUS_META[dispute.status];
            return (
              <Card key={dispute.id}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-foreground">
                          {dispute.merchantName} ↔ {dispute.supplierName}
                        </h2>
                        <StatusPill labelAr={meta.labelAr} variant={meta.variant} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        رفعه {dispute.raisedByName} · {formatDate(dispute.createdAt)} · {formatMoney(dispute.totalAmountMinor, dispute.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setTarget({ id: dispute.id, resolution: "RESOLVED" })}>
                        حل النزاع
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setTarget({ id: dispute.id, resolution: "REJECTED" })}>
                        رفض النزاع
                      </Button>
                    </div>
                  </div>
                  <p className="rounded-md bg-muted/40 p-3 text-sm text-foreground">{dispute.reason}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.resolution === "RESOLVED" ? "حل النزاع" : "رفض النزاع"}</DialogTitle>
          </DialogHeader>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="اكتب ملاحظات القرار..." rows={4} />
          <DialogFooter>
            <Button loading={resolve.isPending} disabled={notes.trim().length < 5} onClick={handleResolve}>
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
