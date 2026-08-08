"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/types";

interface ProductCardProps {
  product: ProductCardData;
  onToggleFavorite?: (productId: string) => void;
  className?: string;
}

/**
 * docs/UIUX-touq.md #C.2 Product Card: image, favorite toggle, featured tag,
 * title, supplier + verified badge + rating, "from" price, MOQ caption.
 */
export function ProductCard({ product, onToggleFavorite, className }: ProductCardProps) {
  return (
    <div className={cn("group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/marketplace/${product.id}`} className="block h-full w-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.titleAr}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" aria-hidden />
            </div>
          )}
        </Link>

        {product.isFeatured ? (
          <Badge variant="gold" className="absolute start-2 top-2">
            مميّز
          </Badge>
        ) : null}

        {onToggleFavorite ? (
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="absolute end-2 top-2 size-9 rounded-full bg-card/90 shadow-sm hover:bg-card"
            onClick={() => onToggleFavorite(product.id)}
            aria-pressed={product.isFavorited}
            aria-label={product.isFavorited ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <Heart className={cn("size-4", product.isFavorited && "fill-destructive text-destructive")} />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link href={`/marketplace/${product.id}`} className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary">
          {product.titleAr}
        </Link>

        <Link
          href={`/suppliers/${product.supplierId}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <span className="truncate">{product.supplierName}</span>
          {product.supplierVerified ? <VerifiedBadge compact /> : null}
        </Link>

        {typeof product.supplierRatingAvg === "number" && product.supplierRatingAvg > 0 ? (
          <RatingStars rating={product.supplierRatingAvg} />
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-foreground">
            من {formatMoney(product.priceFromMinor, product.currency)}
          </span>
          <span className="text-xs text-muted-foreground">الحد الأدنى {product.moq}</span>
        </div>
      </div>
    </div>
  );
}
