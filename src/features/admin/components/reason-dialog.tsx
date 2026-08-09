"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm: (reason: string) => void;
  isPending?: boolean;
  confirmLabel?: string;
}

/** docs/UIUX-touq.md #C.6: "Reject — opens a reason modal, reason required". Shared by verification/moderation rejects. */
export function ReasonDialog({ open, onOpenChange, title, onConfirm, isPending, confirmLabel = "تأكيد الرفض" }: ReasonDialogProps) {
  const [reason, setReason] = React.useState("");
  const isValid = reason.trim().length >= 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="اكتب سبب الرفض بوضوح ليصل للطرف المعني..."
          rows={4}
        />
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={!isValid}
            loading={isPending}
            onClick={() => {
              onConfirm(reason.trim());
              setReason("");
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
