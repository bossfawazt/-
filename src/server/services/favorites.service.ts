import { db } from "@/lib/db";
import type { ProductCardData, SupplierCardData } from "@/types";

/** docs/UIUX-touq.md #C.10: merchant's saved suppliers/products for fast re-access. */

function cheapestTierMinor(tiers: { unitPriceMinor: number }[]): number {
  return tiers.reduce((min, t) => Math.min(min, t.unitPriceMinor), Number.POSITIVE_INFINITY);
}

export interface FavoriteSupplierCardData extends SupplierCardData {
  favoritedAt: string;
}

export interface FavoriteProductCardData extends ProductCardData {
  favoritedAt: string;
}

export interface FavoritesResult {
  suppliers: FavoriteSupplierCardData[];
  products: FavoriteProductCardData[];
}

export async function getFavorites(merchantId: string): Promise<FavoritesResult> {
  const favorites = await db.favorite.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { include: { _count: { select: { products: true } } } },
      product: {
        include: {
          supplier: { select: { id: true, legalNameAr: true, verificationStatus: true, ratingAvg: true } },
          media: { where: { isPrimary: true }, take: 1 },
          variants: { where: { status: "ACTIVE" }, include: { pricingTiers: true } },
        },
      },
    },
  });

  const suppliers: FavoriteSupplierCardData[] = [];
  const products: FavoriteProductCardData[] = [];

  for (const fav of favorites) {
    if (fav.supplier) {
      suppliers.push({
        id: fav.supplier.id,
        legalNameAr: fav.supplier.legalNameAr,
        legalNameEn: fav.supplier.legalNameEn,
        logoUrl: fav.supplier.logoUrl,
        city: fav.supplier.city,
        verified: fav.supplier.verificationStatus === "VERIFIED",
        ratingAvg: Number(fav.supplier.ratingAvg),
        ratingCount: fav.supplier.ratingCount,
        responseTimeAvgMinutes: fav.supplier.responseTimeAvgMinutes,
        productCount: fav.supplier._count.products,
        favoritedAt: fav.createdAt.toISOString(),
      });
    }
    if (fav.product) {
      const allTiers = fav.product.variants.flatMap((v) => v.pricingTiers);
      const priceFromMinor = cheapestTierMinor(allTiers);
      const moq = Math.min(...fav.product.variants.map((v) => v.moq), Number.POSITIVE_INFINITY);
      products.push({
        id: fav.product.id,
        titleAr: fav.product.titleAr,
        titleEn: fav.product.titleEn,
        imageUrl: fav.product.media[0]?.url ?? null,
        supplierId: fav.product.supplier.id,
        supplierName: fav.product.supplier.legalNameAr,
        supplierVerified: fav.product.supplier.verificationStatus === "VERIFIED",
        supplierRatingAvg: Number(fav.product.supplier.ratingAvg),
        priceFromMinor: Number.isFinite(priceFromMinor) ? priceFromMinor : 0,
        currency: allTiers[0]?.currency ?? "SAR",
        moq: Number.isFinite(moq) ? moq : 0,
        isFavorited: true,
        favoritedAt: fav.createdAt.toISOString(),
      });
    }
  }

  return { suppliers, products };
}
