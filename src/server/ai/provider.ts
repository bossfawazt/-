/**
 * Swappable AI provider contract (docs/AI-SYSTEM-touq.md). Every AI Supplier
 * Tool (Phase 13) calls through this interface — src/server/ai/index.ts
 * decides which implementation to hand back. Only a Mock implementation
 * exists today (src/server/ai/mock-provider.ts); wiring a real model API
 * later means adding a new class here and switching the AI_PROVIDER env
 * var, not touching any route or service that calls getAiProvider().
 */

export interface ProductImageSuggestion {
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

export type ImageStudioMode = "enhance" | "remove_bg" | "luxury_bg" | "social_crop";

export interface ImageVariantResult {
  mode: ImageStudioMode;
  labelAr: string;
  url: string;
  note: string;
}

export interface MarketingKitInput {
  titleAr: string;
  descriptionAr: string | null;
  attributes: Record<string, string>;
  priceFromMinor: number;
  moq: number;
}

export interface MarketingKitResult {
  shortDescriptionAr: string;
  longDescriptionAr: string;
  instagramCaption: string;
  tiktokCaption: string;
  whatsappMessage: string;
  hashtags: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface AiProvider {
  readonly name: string;
  analyzeProductImage(imageUrl: string): Promise<ProductImageSuggestion>;
  processImage(imageUrl: string, modes: ImageStudioMode[]): Promise<ImageVariantResult[]>;
  scanCatalogFile(fileUrl: string, fileName: string): Promise<ProductImageSuggestion[]>;
  generateMarketingKit(input: MarketingKitInput): Promise<MarketingKitResult>;
}
