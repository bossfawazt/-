import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

/** docs/UIUX-touq.md #A.6 Badge -> Rating (stars + numeric). */
export function RatingStars({ rating, count, size = "sm", className }: RatingStarsProps) {
  const starSize = size === "sm" ? "size-3.5" : "size-4.5";
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Star className={cn(starSize, "fill-primary text-primary")} aria-hidden />
      <span className={cn("font-medium text-foreground", size === "sm" ? "text-xs" : "text-sm")}>
        {rating.toFixed(1)}
      </span>
      {typeof count === "number" ? (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>({count})</span>
      ) : null}
    </div>
  );
}
