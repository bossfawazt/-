"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductCardData, SupplierCardData } from "@/types";

export interface FavoritesData {
  suppliers: (SupplierCardData & { favoritedAt: string })[];
  products: (ProductCardData & { favoritedAt: string })[];
}

export function useFavoritesQuery() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "تعذر تحميل المفضلة");
      return json.data as FavoritesData;
    },
  });
}
