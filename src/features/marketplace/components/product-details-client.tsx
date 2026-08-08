"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Heart, ImageOff, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ProductCard } from "@/components/shared/product-card";
import { PriceTierTable } from "@/components/shared/price-tier-table";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { RatingStars } from "@/components/shared/rating-stars";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { useToggleFavoriteMutation } from "@/features/marketplace/hooks";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/server/services/catalog.service";
import type { ProductCardData } from "@/types";

interface ProductDetailsClientProps {
  product: ProductDetail;
  related: ProductCardData[];
  initialIsFavorited: boolean;
  viewerRole: "MERCHANT" | "SUPPLIER" | "ADMIN" | null;
}

export function ProductDetailsClient({ product, related, initialIsFavorited, viewerRole }: ProductDetailsClientProps) {
  const pathname = usePathname();
  const toggleFavorite = useToggleFavoriteMutation();
  const [isFavorited, setIsFavorited] = React.useState(initialIsFavorited);

  const [selectedVariantId, setSelectedVariantId] = React.useState(product.variants[0]?.id);
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const [quantity, setQuantity] = React.useState(selectedVariant?.moq ?? 1);

  // Quantity resets to the new variant's MOQ as part of the same user
  // action (selecting a variant), rather than via a separate effect.
  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) setQuantity(variant.moq);
  }

  const galleryMedia = product.media.filter((m) => !m.variantId || m.variantId === selectedVariantId);
  const displayMedia = galleryMedia.length ? galleryMedia : product.media;
  const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);
  const activeMedia = displayMedia[activeMediaIndex] ?? displayMedia[0];

  function handleToggleFavorite() {
    setIsFavorited((prev) => !prev);
    toggleFavorite.mutate({ productId: product.id });
  }

  const rfqHref = !selectedVariant
    ? "#"
    : viewerRole === "MERCHANT"
      ? `/merchant/requests/new?productId=${product.id}&variantId=${selectedVariant.id}&qty=${quantity}`
      : viewerRole === null
        ? `/login?callbackUrl=${encodeURIComponent(pathname)}`
        : "#";

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/marketplace" className="hover:text-foreground">
          السوق
        </Link>
        <ChevronLeft className="size-3.5 rtl:rotate-180" />
        <span className="truncate text-foreground">{product.titleAr}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Media column */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted">
            {activeMedia ? (
              <Image src={activeMedia.url} alt={product.titleAr} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-10" />
              </div>
            )}
          </div>
          {displayMedia.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto">
              {displayMedia.map((media, index) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => setActiveMediaIndex(index)}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-md border-2",
                    index === activeMediaIndex ? "border-primary" : "border-transparent",
                  )}
                >
                  <Image src={media.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info column */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{product.titleAr}</h1>
            {product.titleEn ? <p className="text-sm text-muted-foreground" dir="ltr">{product.titleEn}</p> : null}
          </div>

          <Link href={`/suppliers/${product.supplier.id}`} className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground hover:text-primary">{product.supplier.legalNameAr}</span>
            {product.supplier.verified ? <VerifiedBadge compact /> : null}
            {product.supplier.ratingCount > 0 ? (
              <RatingStars rating={product.supplier.ratingAvg} count={product.supplier.ratingCount} />
            ) : null}
          </Link>

          {product.variants.length > 1 ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">اختر اللون / المقاس</span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => selectVariant(variant.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      variant.id === selectedVariantId
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:border-primary/50",
                    )}
                  >
                    {[variant.color, variant.size].filter(Boolean).join(" / ") || "خيار"}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {selectedVariant ? (
            <>
              <div className="flex flex-wrap items-center gap-4 rounded-md bg-secondary px-4 py-3 text-sm">
                <span>
                  <strong className="font-semibold text-foreground">الحد الأدنى للطلب:</strong> {selectedVariant.moq}
                </span>
                <span>
                  <strong className="font-semibold text-foreground">مدة التوريد:</strong> {selectedVariant.leadTimeDays} أيام
                </span>
                <Badge variant={selectedVariant.stockStatus === "OUT_OF_STOCK" ? "destructive" : "success"}>
                  {selectedVariant.stockStatus === "IN_STOCK"
                    ? "متوفر"
                    : selectedVariant.stockStatus === "MADE_TO_ORDER"
                      ? "حسب الطلب"
                      : "غير متوفر"}
                </Badge>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-foreground">أسعار الجملة</span>
                <PriceTierTable tiers={selectedVariant.pricingTiers} activeQty={quantity} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">الكمية</span>
                <QuantityStepper value={quantity} onChange={setQuantity} min={selectedVariant.moq} />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg" className="flex-1" disabled={rfqHref === "#"}>
                  <Link href={rfqHref}>
                    <MessageSquareText /> إرسال طلب شراء
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" onClick={handleToggleFavorite} aria-pressed={isFavorited}>
                  <Heart className={cn("size-4", isFavorited && "fill-destructive text-destructive")} />
                  {isFavorited ? "في المفضلة" : "أضف للمفضلة"}
                </Button>
              </div>
              {viewerRole && viewerRole !== "MERCHANT" ? (
                <p className="text-xs text-muted-foreground">إرسال طلبات الشراء متاح لحسابات التجار فقط.</p>
              ) : null}
            </>
          ) : null}

          {product.attributes.length > 0 ? (
            <>
              <Separator />
              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">تفاصيل المنتج</h2>
                <Table>
                  <TableBody>
                    {product.attributes.map((attr) => (
                      <TableRow key={attr.labelAr}>
                        <TableCell className="w-1/3 text-muted-foreground">{attr.labelAr}</TableCell>
                        <TableCell className="font-medium">{attr.valueAr}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : null}

          {product.descriptionAr ? (
            <>
              <Separator />
              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">الوصف</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{product.descriptionAr}</p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-lg font-semibold text-foreground">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
