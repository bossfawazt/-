import { z } from "zod";

export const analyzeImageSchema = z.object({ imageUrl: z.string().url() });
export type AnalyzeImageInput = z.infer<typeof analyzeImageSchema>;

export const imageStudioSchema = z.object({
  imageUrl: z.string().url(),
  modes: z.array(z.enum(["enhance", "remove_bg", "luxury_bg", "social_crop"])).min(1),
});
export type ImageStudioInput = z.infer<typeof imageStudioSchema>;

export const catalogScannerSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().min(1),
});
export type CatalogScannerInput = z.infer<typeof catalogScannerSchema>;

export const bulkImportSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(20),
});
export type BulkImportInput = z.infer<typeof bulkImportSchema>;

export const marketingKitSchema = z.object({ productId: z.string().uuid() });
export type MarketingKitInputSchema = z.infer<typeof marketingKitSchema>;

const productSuggestionSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string(),
  descriptionAr: z.string(),
  attributes: z.object({
    fabric: z.string(),
    style: z.string(),
    sleeve: z.string(),
    color: z.string(),
    embroidery: z.string(),
    category: z.string(),
    season: z.string(),
  }),
  suggestedSizes: z.array(z.string()),
  keywords: z.array(z.string()),
  confidence: z.number(),
  imageUrl: z.string().url(),
});

export const publishDraftsSchema = z.object({ drafts: z.array(productSuggestionSchema).min(1) });
export type PublishDraftsInput = z.infer<typeof publishDraftsSchema>;
