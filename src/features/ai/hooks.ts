"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiJobStatus, AiJobType } from "@/generated/prisma/client";
import type { ImageStudioMode } from "@/server/ai";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "تعذرت معالجة الطلب");
  return json.data as T;
}

export interface ProductSuggestionData {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  attributes: {
    fabric: string;
    style: string;
    sleeve: string;
    color: string;
    embroidery: string;
    category: string;
    season: string;
  };
  suggestedSizes: string[];
  keywords: string[];
  confidence: number;
}

export interface ProductDraft extends ProductSuggestionData {
  imageUrl: string;
}

export function useAnalyzeProductImageMutation() {
  return useMutation({
    mutationFn: (imageUrl: string) =>
      requestJson<{ jobId: string; provider: string; suggestion: ProductSuggestionData }>("/api/supplier/ai/product-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      }),
  });
}

export interface ImageVariant {
  mode: ImageStudioMode;
  labelAr: string;
  url: string;
  note: string;
}

export function useImageStudioMutation() {
  return useMutation({
    mutationFn: (input: { imageUrl: string; modes: ImageStudioMode[] }) =>
      requestJson<{ jobId: string; provider: string; variants: ImageVariant[] }>("/api/supplier/ai/image-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}

export function useCatalogScannerMutation() {
  return useMutation({
    mutationFn: (input: { fileUrl: string; fileName: string }) =>
      requestJson<{ jobId: string; provider: string; drafts: ProductDraft[] }>("/api/supplier/ai/catalog-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}

export function useBulkImportMutation() {
  return useMutation({
    mutationFn: (imageUrls: string[]) =>
      requestJson<{ jobId: string; provider: string; drafts: ProductDraft[] }>("/api/supplier/ai/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls }),
      }),
  });
}

export interface MarketingKitData {
  shortDescriptionAr: string;
  longDescriptionAr: string;
  instagramCaption: string;
  tiktokCaption: string;
  whatsappMessage: string;
  hashtags: string[];
  seoTitle: string;
  seoDescription: string;
}

export function useMarketingKitMutation() {
  return useMutation({
    mutationFn: (productId: string) =>
      requestJson<{ jobId: string; provider: string; kit: MarketingKitData }>("/api/supplier/ai/marketing-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }),
  });
}

export function usePublishDraftsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drafts: ProductDraft[]) =>
      requestJson<{ products: { id: string }[] }>("/api/supplier/ai/publish-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drafts }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supplier-products"] }),
  });
}

export interface AiJobHistoryItem {
  id: string;
  type: AiJobType;
  status: AiJobStatus;
  provider: string;
  createdAt: string;
  errorMessage: string | null;
  resultCount: number;
}

export function useAiJobsQuery() {
  return useQuery({
    queryKey: ["ai-jobs"],
    queryFn: () => requestJson<AiJobHistoryItem[]>("/api/supplier/ai/jobs"),
  });
}
