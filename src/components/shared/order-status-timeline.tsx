import { Check } from "lucide-react";
import { ORDER_STATUS_META, ORDER_STATUS_SEQUENCE } from "@/lib/status-labels";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

/** docs/UIUX-touq.md #C.9: order status stepper — horizontal desktop / vertical mobile, direction mirrors RTL automatically via flex row/col + DOM order. */
export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const isTerminalOutlier = status === "CANCELLED" || status === "DISPUTED";
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status);

  if (isTerminalOutlier) {
    const meta = ORDER_STATUS_META[status];
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        {meta.labelAr}
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
      {ORDER_STATUS_SEQUENCE.map((step, index) => {
        const meta = ORDER_STATUS_META[step];
        const isComplete = index < currentIndex || (index === currentIndex && status === "COMPLETED");
        const isCurrent = index === currentIndex && status !== "COMPLETED";
        return (
          <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-2">
            <div className="flex items-center gap-3 sm:w-full sm:flex-col sm:gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  isComplete
                    ? "border-success bg-success text-success-foreground"
                    : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-4" /> : index + 1}
              </span>
              {index < ORDER_STATUS_SEQUENCE.length - 1 ? (
                <span className={cn("h-8 w-0.5 sm:h-0.5 sm:w-full", isComplete ? "bg-success" : "bg-border")} />
              ) : null}
            </div>
            <span className={cn("text-xs font-medium sm:text-center", isCurrent ? "text-primary" : "text-muted-foreground")}>
              {meta.labelAr}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
