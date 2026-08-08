import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** docs/UIUX-touq.md #A.6 Badge: Verified / Status pill / Featured / New. */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        gold: "border-transparent bg-primary/10 text-primary",
        success: "border-transparent bg-success/10 text-success",
        warning: "border-transparent bg-warning/10 text-warning",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        info: "border-transparent bg-info/10 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
