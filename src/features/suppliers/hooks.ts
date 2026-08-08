"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupplierCardData } from "@/types";

export interface SupplierDirectoryFilters {
  q?: string;
  region?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  sort?: "rating" | "newest" | "name";
}

export interface SupplierDirectoryResult {
  items: SupplierCardData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

function buildQueryString(filters: SupplierDirectoryFilters & { page?: number }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || value === false) continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export function useInfiniteSuppliersQuery(filters: SupplierDirectoryFilters) {
  return useInfiniteQuery({
    queryKey: ["suppliers", filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/suppliers?${buildQueryString({ ...filters, page: pageParam })}`);
      if (!res.ok) throw new Error("تعذر تحميل الموردين");
      const json = await res.json();
      return json.data as SupplierDirectoryResult;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export interface SupplierReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  merchantInitials: string;
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
  stats: { totalProducts: number; completedOrders: number };
  policies: { moqMin: number | null; leadTimeMinDays: number | null };
  reviews: { items: SupplierReviewData[]; total: number; distribution: Record<1 | 2 | 3 | 4 | 5, number> };
  isFollowed: boolean;
  reviewableOrderId: string | null;
}

export function useSupplierProfileQuery(supplierId: string) {
  return useQuery({
    queryKey: ["supplier-profile", supplierId],
    queryFn: async () => {
      const res = await fetch(`/api/suppliers/${supplierId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "تعذر تحميل بيانات المورد");
      return json.data as SupplierProfileData;
    },
  });
}

export function useToggleFollowSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplierId: string) => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "تعذر تحديث المتابعة");
      return json.data as { favorited: boolean };
    },
    onSuccess: (_data, supplierId) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-profile", supplierId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
