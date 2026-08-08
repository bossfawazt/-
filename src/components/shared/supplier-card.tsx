import Link from "next/link";
import { Building2, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatMinutes } from "@/lib/format";
import type { SupplierCardData } from "@/types";

interface SupplierCardProps {
  supplier: SupplierCardData;
}

/** docs/UIUX-touq.md #C.1/#C.8: featured supplier card — logo, name, verified badge, rating, city, "View Profile". */
export function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-shadow hover:shadow-md">
      <Avatar className="size-16 border border-border">
        <AvatarImage src={supplier.logoUrl ?? undefined} alt={supplier.legalNameAr} />
        <AvatarFallback>
          <Building2 className="size-6 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {supplier.legalNameAr}
          {supplier.verified ? <VerifiedBadge compact /> : null}
        </span>
        {supplier.city ? <span className="text-xs text-muted-foreground">{supplier.city}</span> : null}
      </div>

      {supplier.ratingCount > 0 ? <RatingStars rating={supplier.ratingAvg} count={supplier.ratingCount} /> : null}

      {supplier.responseTimeAvgMinutes ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          يرد خلال {formatMinutes(supplier.responseTimeAvgMinutes)}
        </span>
      ) : null}

      <Button asChild variant="secondary" size="sm" className="mt-1 w-full">
        <Link href={`/suppliers/${supplier.id}`}>عرض الملف</Link>
      </Button>
    </div>
  );
}
