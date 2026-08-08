/**
 * Lightweight view-model types consumed by shared components
 * (components/shared/*). Kept decoupled from Prisma's generated payload
 * types so a component's prop contract stays stable even as the underlying
 * query shape changes — server/services/* map Prisma results into these.
 */

export interface ProductCardData {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  imageUrl?: string | null;
  supplierId: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierRatingAvg?: number;
  priceFromMinor: number;
  currency: string;
  moq: number;
  isFeatured?: boolean;
  isFavorited?: boolean;
}

export interface SupplierCardData {
  id: string;
  legalNameAr: string;
  legalNameEn?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  responseTimeAvgMinutes?: number | null;
  productCount?: number;
}

export interface PricingTierData {
  minQty: number;
  maxQty?: number | null;
  unitPriceMinor: number;
  currency: string;
}
