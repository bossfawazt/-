import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  labelAr: string;
  labelEn?: string;
  variant: React.ComponentProps<typeof Badge>["variant"];
  className?: string;
}

/** docs/UIUX-touq.md #A.6 Badge -> Status pill: color-coded per lifecycle state. */
export function StatusPill({ labelAr, labelEn, variant, className }: StatusPillProps) {
  return (
    <Badge variant={variant} className={cn("font-semibold", className)}>
      {labelAr}
      {labelEn ? <span className="text-[10px] font-normal opacity-70">({labelEn})</span> : null}
    </Badge>
  );
}
