import { db } from "@/lib/db";
import type { SupplierCardData } from "@/types";

/** Server-side read queries for public catalog surfaces (Landing, Marketplace, Phase 6-7). */

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
