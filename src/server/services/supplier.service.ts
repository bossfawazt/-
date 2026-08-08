import { db } from "@/lib/db";
import type { SupplierCardData } from "@/types";

/** Server-side read queries for public supplier surfaces (docs/UIUX-touq.md #C.3/#C.8). */

export interface SupplierDirectoryFilters {
  query?: string;
  regionId?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  sort?: "rating" | "newest" | "name";
  page?: number;
  limit?: number;
}

export interface SupplierDirectoryResult {
  items: SupplierCardData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getSuppliers(filters: SupplierDirectoryFilters): Promise<SupplierDirectoryResult> {
  const { page = 1, limit = 20 } = filters;

  const where = {
    type: "SUPPLIER" as const,
    status: "ACTIVE" as const,
    ...(filters.query
      ? {
          OR: [
            { legalNameAr: { contains: filters.query, mode: "insensitive" as const } },
            { legalNameEn: { contains: filters.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.regionId ? { regionId: filters.regionId } : {}),
    ...(filters.verifiedOnly ? { verificationStatus: "VERIFIED" as const } : {}),
    ...(typeof filters.minRating === "number" ? { ratingAvg: { gte: filters.minRating } } : {}),
  };

  const orderBy =
    filters.sort === "name"
      ? [{ legalNameAr: "asc" as const }]
      : filters.sort === "newest"
        ? [{ createdAt: "desc" as const }]
        : [{ ratingAvg: "desc" as const }, { ratingCount: "desc" as const }];

  const [rows, total] = await Promise.all([
    db.organization.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
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
        _count: { select: { products: { where: { status: "LIVE" } } } },
      },
    }),
    db.organization.count({ where }),
  ]);

  const items: SupplierCardData[] = rows.map((s) => ({
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

  return { items, total, page, limit, hasMore: page * limit < total };
}

function maskCrNumber(crNumber: string | null): string | null {
  if (!crNumber) return null;
  const last4 = crNumber.slice(-4);
  return `••••${last4}`;
}

export interface SupplierProfileData {
  id: string;
  legalNameAr: string;
  legalNameEn: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  regionNameAr: string | null;
  verified: boolean;
  verificationStatus: string;
  crNumberMasked: string | null;
  maroofId: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  ratingAvg: number;
  ratingCount: number;
  responseTimeAvgMinutes: number | null;
  memberSince: string;
  stats: {
    totalProducts: number;
    completedOrders: number;
  };
  policies: {
    moqMin: number | null;
    leadTimeMinDays: number | null;
  };
}

export async function getSupplierProfile(supplierId: string): Promise<SupplierProfileData | null> {
  const organization = await db.organization.findFirst({
    where: { id: supplierId, type: "SUPPLIER", status: "ACTIVE" },
    include: { region: { select: { nameAr: true } } },
  });
  if (!organization) return null;

  const [totalProducts, completedOrders, variantAgg] = await Promise.all([
    db.product.count({ where: { supplierId, status: "LIVE" } }),
    db.order.count({ where: { supplierId, status: "COMPLETED" } }),
    db.productVariant.aggregate({
      where: { status: "ACTIVE", product: { supplierId, status: "LIVE" } },
      _min: { moq: true, leadTimeDays: true },
    }),
  ]);

  return {
    id: organization.id,
    legalNameAr: organization.legalNameAr,
    legalNameEn: organization.legalNameEn,
    logoUrl: organization.logoUrl,
    coverUrl: organization.coverUrl,
    city: organization.city,
    regionNameAr: organization.region?.nameAr ?? null,
    verified: organization.verificationStatus === "VERIFIED",
    verificationStatus: organization.verificationStatus,
    crNumberMasked: maskCrNumber(organization.crNumber),
    maroofId: organization.maroofId,
    descriptionAr: organization.descriptionAr,
    descriptionEn: organization.descriptionEn,
    ratingAvg: Number(organization.ratingAvg),
    ratingCount: organization.ratingCount,
    responseTimeAvgMinutes: organization.responseTimeAvgMinutes,
    memberSince: organization.createdAt.toISOString(),
    stats: { totalProducts, completedOrders },
    policies: { moqMin: variantAgg._min.moq, leadTimeMinDays: variantAgg._min.leadTimeDays },
  };
}

export interface SupplierReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  merchantInitials: string;
}

export interface SupplierReviewsResult {
  items: SupplierReviewData[];
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join("");
}

export async function getSupplierReviews(supplierId: string, limit = 20): Promise<SupplierReviewsResult> {
  const [rows, total, grouped] = await Promise.all([
    db.review.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { merchant: { select: { legalNameAr: true } } },
    }),
    db.review.count({ where: { supplierId } }),
    db.review.groupBy({ by: ["rating"], where: { supplierId }, _count: { rating: true } }),
  ]);

  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of grouped) {
    const rating = g.rating as 1 | 2 | 3 | 4 | 5;
    if (rating in distribution) distribution[rating] = g._count.rating;
  }

  const items: SupplierReviewData[] = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    merchantInitials: initialsOf(r.merchant.legalNameAr),
  }));

  return { items, total, distribution };
}
