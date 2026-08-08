"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductStatus } from "@/generated/prisma/client";
import type { ProductFormInput } from "@/lib/validations/product";

export interface SupplierProductListItem {
  id: string;
  titleAr: string;
  titleEn: string | null;
  status: ProductStatus;
  imageUrl: string | null;
  variantCount: number;
  priceMinMinor: number | null;
  priceMaxMinor: number | null;
  updatedAt: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "حدث خطأ غير متوقع");
  return json.data as T;
}

export function useSupplierProductsQuery() {
  return useQuery({
    queryKey: ["supplier-products"],
    queryFn: () => fetchJson<SupplierProductListItem[]>("/api/supplier/products"),
  });
}

export function useSupplierProductQuery(productId: string | undefined) {
  return useQuery({
    queryKey: ["supplier-product", productId],
    queryFn: () => fetchJson(`/api/supplier/products/${productId}`),
    enabled: !!productId,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductFormInput) =>
      fetchJson("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supplier-products"] }),
  });
}

export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductFormInput) =>
      fetchJson(`/api/supplier/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-product", productId] });
    },
  });
}

export function useProductStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, action }: { productId: string; action: "submit_for_review" | "pause" | "resume" | "archive" }) =>
      fetchJson(`/api/supplier/products/${productId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supplier-products"] }),
  });
}
