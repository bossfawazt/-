"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ReasonDialog } from "@/features/admin/components/reason-dialog";
import { useVerificationQueueQuery, useVerifyOrganizationMutation } from "@/features/admin/hooks";
import { formatDate } from "@/lib/format";

const ORG_TYPE_LABEL: Record<string, string> = { SUPPLIER: "مورد", MERCHANT: "تاجر" };

/** docs/UIUX-touq.md #C.6: Verification Queue — approve/reject pending organizations. */
export function VerificationQueueClient() {
  const { data: queue, isLoading } = useVerificationQueueQuery();
  const verify = useVerifyOrganizationMutation();
  const [rejectTarget, setRejectTarget] = React.useState<string | null>(null);

  async function handleApprove(organizationId: string) {
    try {
      await verify.mutateAsync({ organizationId, action: "approve" });
      toast.success("تم توثيق المنشأة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تنفيذ الإجراء");
    }
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) return;
    try {
      await verify.mutateAsync({ organizationId: rejectTarget, action: "reject", reason });
      toast.success("تم رفض طلب التوثيق");
      setRejectTarget(null);
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
      <h1 className="mb-6 text-xl font-semibold text-foreground">طلبات التوثيق</h1>

      {!queue?.length ? (
        <EmptyState icon={ShieldCheck} title="لا توجد طلبات توثيق معلّقة" description="ستظهر هنا طلبات المنشآت الجديدة عند التسجيل." />
      ) : (
        <div className="flex flex-col gap-4">
          {queue.map((org) => (
            <Card key={org.id}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-foreground">{org.legalNameAr}</h2>
                      <Badge variant="outline">{ORG_TYPE_LABEL[org.type] ?? org.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {org.regionNameAr ?? org.city ?? "—"} · تاريخ التقديم {formatDate(org.submittedAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                      {org.crNumber ? `CR: ${org.crNumber}` : ""} {org.maroofId ? `· Maroof: ${org.maroofId}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleApprove(org.id)} loading={verify.isPending}>
                      موافقة
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setRejectTarget(org.id)}>
                      رفض
                    </Button>
                  </div>
                </div>

                {org.documents.length ? (
                  <div className="flex flex-wrap gap-2">
                    {org.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/40"
                      >
                        <FileText className="size-3.5" /> {doc.docType}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">لم يتم رفع مستندات بعد.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReasonDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="رفض طلب التوثيق"
        onConfirm={handleReject}
        isPending={verify.isPending}
      />
    </div>
  );
}
