import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  emphasis?: boolean;
  hint?: string;
  className?: string;
}

/** docs/UIUX-touq.md #C.4/#C.5/#C.6: dashboard stat tile row. */
export function StatTile({ label, value, icon: Icon, emphasis, hint, className }: StatTileProps) {
  return (
    <Card className={cn(emphasis && "border-primary/40 bg-primary/5", className)}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold text-foreground">{value}</span>
          {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              emphasis ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
