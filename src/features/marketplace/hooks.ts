"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductCardData } from "@/types";

export interface AttributeOptionData {
  id: string;
  key: string;
  valueAr: string;
  valueEn: string;
}

export interface AttributeDefinitionData {
  id: string;
  key: string;
  labelAr: string;
  labelEn: string;
  options: AttributeOptionData[];
}

export interface ProductListResult {
  items: ProductCardData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MarketplaceFilters {
  q?: string;
  style?: string[];
  fabric?: string[];
  color?: string[];
  embroidery?: string[];
  season?: string[];
  category?: string[];
  priceMin?: number;
  priceMax?: number;
  verifiedOnly?: boolean;
  sort?: string;
  page?: number;
}

function buildQueryString(filters: MarketplaceFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || value === false) continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
      continue;
    }
    params.set(key, String(value));
  }
  return params.toString();
}

/**
 * Uses TanStack Query's built-in pagination accumulation (`useInfiniteQuery`)
 * for the "Load More" grid (docs/UIUX-touq.md #C.2) instead of hand-rolled
 * state syncing — the idiomatic fix for what would otherwise need a
 * setState-in-effect pattern React now lints against.
 */
export function useInfiniteProductsQuery(filters: Omit<MarketplaceFilters, "page">) {
  return useInfiniteQuery({
    queryKey: ["products", filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/products?${buildQueryString({ ...filters, page: pageParam })}`);
      if (!res.ok) throw new Error("تعذر تحميل المنتجات");
      const json = await res.json();
      return json.data as ProductListResult;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("تعذر تحميل التصنيفات");
      const json = await res.json();
      return json.data as AttributeDefinitionData[];
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { productId?: string; supplierId?: string }) => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "تعذر تحديث المفضلة");
      return json.data as { favorited: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
