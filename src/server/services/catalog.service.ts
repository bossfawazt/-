import { db } from "@/lib/db";
import { ROOT_CATEGORY_SLUG } from "@/lib/taxonomy";
import type { PricingTierData, ProductCardData, SupplierCardData } from "@/types";

/** Server-side read queries for public catalog surfaces (Landing, Marketplace, Phase 6-7). */

export interface ProductFilters {
  query?: string;
  /** Attribute key -> option keys (OR within a key, AND across keys), e.g. { style: ["open_farasha", "kimono"] } */
  attributes?: Record<string, string[]>;
  priceMinMinor?: number;
  priceMaxMinor?: number;
  moqMax?: number;
  regionId?: string;
  minRating?: number;
  verifiedOnly?: boolean;
  inStockOnly?: boolean;
  sort?: "relevance" | "newest" | "price_asc" | "price_desc" | "rating";
  page?: number;
  limit?: number;
  /** Product ids already favorited by the requesting merchant, to flag ProductCardData.isFavorited. */
  favoritedProductIds?: Set<string>;
}

function cheapestTierMinor(pricingTiers: { unitPriceMinor: number }[]): number {
  return pricingTiers.reduce((min, tier) => Math.min(min, tier.unitPriceMinor), Number.POSITIVE_INFINITY);
}

/**
 * Filters/sorts the live catalog. Non-price filters run in the DB; price
 * range/sort run in-memory over the DB-filtered set, and pagination is
 * simple offset-based — a deliberate MVP shortcut (docs/ROADMAP-touq.md M3),
 * replaced by the dedicated Search Service once catalog volume needs it
 * (docs/ARCHITECTURE-touq.md #13).
 */
export async function getProducts(filters: ProductFilters) {
  const { page = 1, limit = 20 } = filters;

  const attributeConditions = Object.entries(filters.attributes ?? {})
    .filter(([, optionKeys]) => optionKeys.length > 0)
    .map(([attrKey, optionKeys]) => ({
      attributeValues: {
        some: {
          attributeDefinition: { key: attrKey },
          attributeOption: { key: { in: optionKeys } },
        },
      },
    }));

  const products = await db.product.findMany({
    where: {
      status: "LIVE",
      ...(filters.query
        ? {
            OR: [
              { titleAr: { contains: filters.query, mode: "insensitive" } },
              { titleEn: { contains: filters.query, mode: "insensitive" } },
            ],
          }
        : {}),
      AND: attributeConditions,
      supplier: {
        status: "ACTIVE",
        ...(filters.verifiedOnly ? { verificationStatus: "VERIFIED" } : {}),
        ...(filters.regionId ? { regionId: filters.regionId } : {}),
        ...(typeof filters.minRating === "number" ? { ratingAvg: { gte: filters.minRating } } : {}),
      },
      variants: {
        some: {
          status: "ACTIVE",
          ...(filters.inStockOnly ? { stockStatus: { not: "OUT_OF_STOCK" } } : {}),
          ...(typeof filters.moqMax === "number" ? { moq: { lte: filters.moqMax } } : {}),
        },
      },
    },
    orderBy: filters.sort === "newest" || !filters.sort || filters.sort === "relevance" ? { publishedAt: "desc" } : undefined,
    include: {
      supplier: { select: { id: true, legalNameAr: true, legalNameEn: true, verificationStatus: true, ratingAvg: true } },
      media: { where: { isPrimary: true }, take: 1 },
      variants: { where: { status: "ACTIVE" }, include: { pricingTiers: true } },
    },
    take: 200, // bounded working set for the in-memory price filter/sort below
  });

  let items: ProductCardData[] = products
    .map((product) => {
      const allTiers = product.variants.flatMap((v) => v.pricingTiers);
      const priceFromMinor = cheapestTierMinor(allTiers);
      const moq = Math.min(...product.variants.map((v) => v.moq), Number.POSITIVE_INFINITY);
      return {
        id: product.id,
        titleAr: product.titleAr,
        titleEn: product.titleEn,
        imageUrl: product.media[0]?.url ?? null,
        supplierId: product.supplier.id,
        supplierName: product.supplier.legalNameAr,
        supplierVerified: product.supplier.verificationStatus === "VERIFIED",
        supplierRatingAvg: Number(product.supplier.ratingAvg),
        priceFromMinor: Number.isFinite(priceFromMinor) ? priceFromMinor : 0,
        currency: allTiers[0]?.currency ?? "SAR",
        moq: Number.isFinite(moq) ? moq : 0,
        isFavorited: filters.favoritedProductIds?.has(product.id) ?? false,
      };
    })
    .filter((item) => {
      if (typeof filters.priceMinMinor === "number" && item.priceFromMinor < filters.priceMinMinor) return false;
      if (typeof filters.priceMaxMinor === "number" && item.priceFromMinor > filters.priceMaxMinor) return false;
      return true;
    });

  if (filters.sort === "price_asc") items = items.sort((a, b) => a.priceFromMinor - b.priceFromMinor);
  if (filters.sort === "price_desc") items = items.sort((a, b) => b.priceFromMinor - a.priceFromMinor);
  if (filters.sort === "rating") items = items.sort((a, b) => (b.supplierRatingAvg ?? 0) - (a.supplierRatingAvg ?? 0));

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return { items: paged, total, page, limit, hasMore: start + limit < total };
}

export async function getFilterableAttributes() {
  return db.attributeDefinition.findMany({
    where: { category: { slug: ROOT_CATEGORY_SLUG }, isFilterable: true },
    orderBy: { sortOrder: "asc" },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
}

export interface ProductDetail {
  id: string;
  titleAr: string;
  titleEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  media: { id: string; url: string; isPrimary: boolean; variantId: string | null }[];
  attributes: { labelAr: string; labelEn: string; valueAr: string; valueEn: string }[];
  variants: {
    id: string;
    color: string | null;
    size: string | null;
    moq: number;
    leadTimeDays: number;
    stockStatus: string;
    pricingTiers: PricingTierData[];
  }[];
  supplier: SupplierCardData & { descriptionAr: string | null; responseTimeAvgMinutes: number | null };
}

export async function getProductById(productId: string): Promise<ProductDetail | null> {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      attributeValues: { include: { attributeDefinition: true, attributeOption: true } },
      variants: { where: { status: "ACTIVE" }, include: { pricingTiers: { orderBy: { minQty: "asc" } } } },
      supplier: { include: { _count: { select: { products: true } } } },
    },
  });

  if (!product || product.status !== "LIVE") return null;

  return {
    id: product.id,
    titleAr: product.titleAr,
    titleEn: product.titleEn,
    descriptionAr: product.descriptionAr,
    descriptionEn: product.descriptionEn,
    media: product.media.map((m) => ({ id: m.id, url: m.url, isPrimary: m.isPrimary, variantId: m.variantId })),
    attributes: product.attributeValues
      .filter((av) => av.attributeOption)
      .map((av) => ({
        labelAr: av.attributeDefinition.labelAr,
        labelEn: av.attributeDefinition.labelEn,
        valueAr: av.attributeOption!.valueAr,
        valueEn: av.attributeOption!.valueEn,
      })),
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      moq: v.moq,
      leadTimeDays: v.leadTimeDays,
      stockStatus: v.stockStatus,
      pricingTiers: v.pricingTiers.map((t) => ({
        minQty: t.minQty,
        maxQty: t.maxQty,
        unitPriceMinor: t.unitPriceMinor,
        currency: t.currency,
      })),
    })),
    supplier: {
      id: product.supplier.id,
      legalNameAr: product.supplier.legalNameAr,
      legalNameEn: product.supplier.legalNameEn,
      logoUrl: product.supplier.logoUrl,
      city: product.supplier.city,
      verified: product.supplier.verificationStatus === "VERIFIED",
      ratingAvg: Number(product.supplier.ratingAvg),
      ratingCount: product.supplier.ratingCount,
      responseTimeAvgMinutes: product.supplier.responseTimeAvgMinutes,
      productCount: product.supplier._count.products,
      descriptionAr: product.supplier.descriptionAr,
    },
  };
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<ProductCardData[]> {
  const products = await db.product.findMany({
    where: { status: "LIVE", categoryId, id: { not: productId } },
    take: limit,
    include: {
      supplier: { select: { id: true, legalNameAr: true, verificationStatus: true, ratingAvg: true } },
      media: { where: { isPrimary: true }, take: 1 },
      variants: { include: { pricingTiers: true }, take: 1 },
    },
  });

  return products.map((product) => {
    const allTiers = product.variants.flatMap((v) => v.pricingTiers);
    const priceFromMinor = cheapestTierMinor(allTiers);
    return {
      id: product.id,
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      imageUrl: product.media[0]?.url ?? null,
      supplierId: product.supplier.id,
      supplierName: product.supplier.legalNameAr,
      supplierVerified: product.supplier.verificationStatus === "VERIFIED",
      supplierRatingAvg: Number(product.supplier.ratingAvg),
      priceFromMinor: Number.isFinite(priceFromMinor) ? priceFromMinor : 0,
      currency: allTiers[0]?.currency ?? "SAR",
      moq: product.variants[0]?.moq ?? 0,
    };
  });
}

export async function getFeaturedSuppliers(limit = 4): Promise<SupplierCardData[]> {
  const suppliers = await db.organization.findMany({
    where: { type: "SUPPLIER", status: "ACTIVE", verificationStatus: "VERIFIED" },
    orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
    take: limit,
    select: {
      id: true,
      legalNameAr: true,
      legalNameEn: true,
      logoUrl: true,
      city: true,
      verificationStatus: true,
      ratingAvg: true,
      ratingCount: true,
      responseTimeAvgMinutes: true,
      _count: { select: { products: true } },
    },
  });

  return suppliers.map((s) => ({
    id: s.id,
    legalNameAr: s.legalNameAr,
    legalNameEn: s.legalNameEn,
    logoUrl: s.logoUrl,
    city: s.city,
    verified: s.verificationStatus === "VERIFIED",
    ratingAvg: Number(s.ratingAvg),
    ratingCount: s.ratingCount,
    responseTimeAvgMinutes: s.responseTimeAvgMinutes,
    productCount: s._count.products,
  }));
}

export async function getPlatformStats() {
  const [supplierCount, merchantCount, productCount, cityCount] = await Promise.all([
    db.organization.count({ where: { type: "SUPPLIER", status: "ACTIVE" } }),
    db.organization.count({ where: { type: "MERCHANT", status: "ACTIVE" } }),
    db.product.count({ where: { status: "LIVE" } }),
    db.region.count({ where: { parentId: { not: null } } }),
  ]);

  return { supplierCount, merchantCount, productCount, cityCount };
}
