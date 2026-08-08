import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** docs/UIUX-touq.md #C.3: prominent gold check + "موثّق" label — the platform's core trust signal. */
export function VerifiedBadge({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-primary", className)}>
      <BadgeCheck className="size-4 fill-primary/15" aria-hidden />
      {!compact && "موثّق"}
    </span>
  );
}
