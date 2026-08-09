import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { getAiProvider } from "@/server/ai";
import type { ImageStudioMode, ProductImageSuggestion } from "@/server/ai";
import { createProduct } from "@/server/services/product.service";

export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function createJob(supplierId: string, type: "PRODUCT_CREATOR" | "IMAGE_STUDIO" | "CATALOG_SCANNER" | "BULK_IMPORT" | "MARKETING_KIT", inputJson: unknown) {
  const provider = getAiProvider();
  return db.aiJob.create({
    data: { supplierId, type, status: "PROCESSING", provider: provider.name, inputJson: inputJson as Prisma.InputJsonValue },
  });
}

async function completeJob(jobId: string, results: { kind: string; dataJson: unknown }[]) {
  await db.$transaction([
    db.aiJob.update({ where: { id: jobId }, data: { status: "COMPLETED" } }),
    db.aiResult.createMany({
      data: results.map((r) => ({ jobId, kind: r.kind, dataJson: r.dataJson as Prisma.InputJsonValue })),
    }),
  ]);
}

async function failJob(jobId: string, message: string) {
  await db.aiJob.update({ where: { id: jobId }, data: { status: "FAILED", errorMessage: message } });
}

export async function runProductCreatorJob(supplierId: string, imageUrl: string) {
  const job = await createJob(supplierId, "PRODUCT_CREATOR", { imageUrl });
  try {
    const suggestion = await getAiProvider().analyzeProductImage(imageUrl);
    await completeJob(job.id, [{ kind: "product_draft", dataJson: { ...suggestion, imageUrl } }]);
    return { jobId: job.id, provider: getAiProvider().name, suggestion };
  } catch (error) {
    await failJob(job.id, error instanceof Error ? error.message : "فشلت المعالجة");
    throw error;
  }
}

export async function runImageStudioJob(supplierId: string, imageUrl: string, modes: ImageStudioMode[]) {
  const job = await createJob(supplierId, "IMAGE_STUDIO", { imageUrl, modes });
  try {
    const variants = await getAiProvider().processImage(imageUrl, modes);
    await completeJob(job.id, variants.map((v) => ({ kind: "image_variant", dataJson: v })));
    return { jobId: job.id, provider: getAiProvider().name, variants };
  } catch (error) {
    await failJob(job.id, error instanceof Error ? error.message : "فشلت المعالجة");
    throw error;
  }
}

/**
 * A scanned PDF/ZIP has no per-item photo to point the resulting draft cards
 * at, so each draft gets a themed placeholder (same convention as the seed
 * data) rather than misusing the source document's own URL as an <Image>
 * src — the supplier replaces it with a real product photo when they finish
 * editing the draft.
 */
function placeholderImageFor(titleEn: string): string {
  return `https://placehold.co/800x1000/f8f4ee/201d1a?text=${encodeURIComponent(titleEn)}`;
}

export async function runCatalogScannerJob(supplierId: string, fileUrl: string, fileName: string) {
  const job = await createJob(supplierId, "CATALOG_SCANNER", { fileUrl, fileName });
  try {
    const suggestions = await getAiProvider().scanCatalogFile(fileUrl, fileName);
    const drafts = suggestions.map((d) => ({ ...d, imageUrl: placeholderImageFor(d.titleEn) }));
    await completeJob(
      job.id,
      drafts.map((d) => ({ kind: "product_draft", dataJson: d })),
    );
    return { jobId: job.id, provider: getAiProvider().name, drafts };
  } catch (error) {
    await failJob(job.id, error instanceof Error ? error.message : "فشلت المعالجة");
    throw error;
  }
}

export async function runBulkImportJob(supplierId: string, imageUrls: string[]) {
  const job = await createJob(supplierId, "BULK_IMPORT", { imageUrls });
  try {
    const provider = getAiProvider();
    const drafts = await Promise.all(
      imageUrls.map(async (url) => ({ ...(await provider.analyzeProductImage(url)), imageUrl: url })),
    );
    await completeJob(
      job.id,
      drafts.map((d) => ({ kind: "product_draft", dataJson: d })),
    );
    return { jobId: job.id, provider: provider.name, drafts };
  } catch (error) {
    await failJob(job.id, error instanceof Error ? error.message : "فشلت المعالجة");
    throw error;
  }
}

export async function runMarketingKitJob(supplierId: string, productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      attributeValues: { include: { attributeDefinition: true, attributeOption: true } },
      variants: { include: { pricingTiers: true } },
    },
  });
  if (!product || product.supplierId !== supplierId) throw new AiServiceError("المنتج غير موجود");

  const attributes = Object.fromEntries(
    product.attributeValues
      .filter((v) => v.attributeOption)
      .map((v) => [v.attributeDefinition.key, v.attributeOption!.valueAr]),
  );
  const allTiers = product.variants.flatMap((v) => v.pricingTiers);
  const priceFromMinor = allTiers.length ? Math.min(...allTiers.map((t) => t.unitPriceMinor)) : 0;
  const moq = product.variants.length ? Math.min(...product.variants.map((v) => v.moq)) : 1;

  const job = await createJob(supplierId, "MARKETING_KIT", { productId });
  try {
    const kit = await getAiProvider().generateMarketingKit({
      titleAr: product.titleAr,
      descriptionAr: product.descriptionAr,
      attributes,
      priceFromMinor,
      moq,
    });
    await completeJob(job.id, [{ kind: "marketing_asset", dataJson: kit }]);
    return { jobId: job.id, provider: getAiProvider().name, kit };
  } catch (error) {
    await failJob(job.id, error instanceof Error ? error.message : "فشلت المعالجة");
    throw error;
  }
}

/** Creates real DRAFT products from AI-suggested drafts, with placeholder pricing the supplier must review before publishing (docs' explicit requirement: nothing goes live without human review). */
export async function publishAiDrafts(supplierId: string, drafts: (ProductImageSuggestion & { imageUrl: string })[]) {
  const created = [];
  for (const draft of drafts) {
    const product = await createProduct(supplierId, {
      titleAr: draft.titleAr,
      titleEn: draft.titleEn,
      descriptionAr: draft.descriptionAr,
      attributes: draft.attributes,
      media: [{ url: draft.imageUrl, isPrimary: true }],
      variants: [
        {
          color: draft.attributes.color,
          size: draft.suggestedSizes[0] ?? "",
          moq: 10,
          leadTimeDays: 7,
          stockStatus: "MADE_TO_ORDER",
          pricingTiers: [{ minQty: 10, maxQty: null, unitPriceSar: 100 }],
        },
      ],
    });
    created.push(product);
  }
  return created;
}
