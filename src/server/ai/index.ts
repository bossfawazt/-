import { MockAiProvider } from "@/server/ai/mock-provider";
import type { AiProvider } from "@/server/ai/provider";

/**
 * Provider switch point. Only "mock" exists today; set AI_PROVIDER in .env
 * and add a case here to wire in a real model API without touching any
 * caller (src/server/services/ai.service.ts and the /api/supplier/ai/*
 * routes only ever depend on the AiProvider interface).
 */
export function getAiProvider(): AiProvider {
  return new MockAiProvider();
}

export type { AiProvider } from "@/server/ai/provider";
export type {
  ProductImageSuggestion,
  ImageStudioMode,
  ImageVariantResult,
  MarketingKitInput,
  MarketingKitResult,
} from "@/server/ai/provider";
