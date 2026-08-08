import { cn } from "@/lib/utils";

/** docs/UIUX-touq.md #C.14: skeleton blocks matching the final layout, not a bare spinner. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
