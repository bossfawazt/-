import { db } from "@/lib/db";
import { ROOT_CATEGORY_SLUG } from "@/lib/taxonomy";
import type { ProductFormInput } from "@/lib/validations/product";

export class ProductNotFoundError extends Error {
  constructor() {
    super("product_not_found");
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function getAbayaCategoryId() {
  const category = await db.category.findUniqueOrThrow({ where: { slug: ROOT_CATEGORY_SLUG } });
  return category.id;
}

/** Resolves { fabric: "chiffon", ... } option keys to {attributeDefinitionId, attributeOptionId} pairs. */
async function resolveAttributeIds(attributes: ProductFormInput["attributes"]) {
  const definitions = await db.attributeDefinition.findMany({
    where: { category: { slug: ROOT_CATEGORY_SLUG }, key: { in: Object.keys(attributes) } },
    include: { options: true },
  });

  return Object.entries(attributes).map(([attrKey, optionKey]) => {
    const definition = definitions.find((d) => d.key === attrKey);
    const option = definition?.options.find((o) => o.key === optionKey);
    if (!definition || !option) {
      throw new Error(`Unknown attribute/option: ${attrKey}=${optionKey}`);
    }
    return { attributeDefinitionId: definition.id, attributeOptionId: option.id };
  });
}

export async function listSupplierProducts(supplierId: string) {
  const products = await db.product.findMany({
    where: { supplierId },
    orderBy: { updatedAt: "desc" },
    include: {
      media: { where: { isPrimary: true }, take: 1 },
      variants: { include: { pricingTiers: true } },
    },
  });

  return products.map((product) => {
    const allTiers = product.variants.flatMap((v) => v.pricingTiers);
    const prices = allTiers.map((t) => t.unitPriceMinor);
    return {
      id: product.id,
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      status: product.status,
      imageUrl: product.media[0]?.url ?? null,
      variantCount: product.variants.length,
      priceMinMinor: prices.length ? Math.min(...prices) : null,
      priceMaxMinor: prices.length ? Math.max(...prices) : null,
      updatedAt: product.updatedAt,
    };
  });
}

export async function getSupplierProductById(supplierId: string, productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      attributeValues: { include: { attributeDefinition: true, attributeOption: true } },
      variants: { include: { pricingTiers: { orderBy: { minQty: "asc" } } } },
    },
  });

  if (!product || product.supplierId !== supplierId) throw new ProductNotFoundError();
  return product;
}

export async function createProduct(supplierId: string, input: ProductFormInput) {
  const categoryId = await getAbayaCategoryId();
  const attributeIds = await resolveAttributeIds(input.attributes);

  return db.product.create({
    data: {
      supplierId,
      categoryId,
      titleAr: input.titleAr,
      titleEn: input.titleEn || null,
      descriptionAr: input.descriptionAr || null,
      status: "DRAFT",
      attributeValues: { create: attributeIds },
      media: {
        create: input.media.map((m, index) => ({ url: m.url, isPrimary: m.isPrimary, sortOrder: index })),
      },
      variants: {
        create: input.variants.map((v) => ({
          color: v.color || null,
          size: v.size || null,
          moq: v.moq,
          leadTimeDays: v.leadTimeDays,
          stockStatus: v.stockStatus,
          pricingTiers: {
            create: v.pricingTiers.map((t) => ({
              minQty: t.minQty,
              maxQty: t.maxQty || null,
              unitPriceMinor: Math.round(t.unitPriceSar * 100),
            })),
          },
        })),
      },
    },
  });
}

/**
 * Full-replace update: child rows (attributes/variants/pricing tiers/media)
 * are deleted and recreated inside one transaction — simpler and safer to
 * reason about than diffing a form-submitted array against existing rows,
 * appropriate at this catalog's scale.
 */
export async function updateProduct(supplierId: string, productId: string, input: ProductFormInput) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.supplierId !== supplierId) throw new ProductNotFoundError();

  const attributeIds = await resolveAttributeIds(input.attributes);

  return db.$transaction(async (tx) => {
    await tx.productAttributeValue.deleteMany({ where: { productId } });
    await tx.productMedia.deleteMany({ where: { productId } });
    await tx.productVariant.deleteMany({ where: { productId } }); // cascades to pricing_tiers

    return tx.product.update({
      where: { id: productId },
      data: {
        titleAr: input.titleAr,
        titleEn: input.titleEn || null,
        descriptionAr: input.descriptionAr || null,
        // Editing a live listing sends it back through moderation —
        // mirrors the product lifecycle in docs/ARCHITECTURE-touq.md #10.
        status: product.status === "LIVE" ? "PENDING_REVIEW" : product.status,
        attributeValues: { create: attributeIds },
        media: { create: input.media.map((m, index) => ({ url: m.url, isPrimary: m.isPrimary, sortOrder: index })) },
        variants: {
          create: input.variants.map((v) => ({
            color: v.color || null,
            size: v.size || null,
            moq: v.moq,
            leadTimeDays: v.leadTimeDays,
            stockStatus: v.stockStatus,
            pricingTiers: {
              create: v.pricingTiers.map((t) => ({
                minQty: t.minQty,
                maxQty: t.maxQty || null,
                unitPriceMinor: Math.round(t.unitPriceSar * 100),
              })),
            },
          })),
        },
      },
    });
  });
}

const ALLOWED_TRANSITIONS: Record<string, { from: string[]; to: string }> = {
  submit_for_review: { from: ["DRAFT", "REJECTED"], to: "PENDING_REVIEW" },
  pause: { from: ["LIVE"], to: "PAUSED" },
  resume: { from: ["PAUSED"], to: "LIVE" },
  archive: { from: ["LIVE", "PAUSED", "DRAFT", "REJECTED"], to: "ARCHIVED" },
};

/** Product lifecycle state machine (docs/ARCHITECTURE-touq.md #10) — supplier-triggered transitions only; PENDING_REVIEW -> LIVE is an Admin action (Phase 11). */
export async function changeProductStatus(supplierId: string, productId: string, action: keyof typeof ALLOWED_TRANSITIONS) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.supplierId !== supplierId) throw new ProductNotFoundError();

  const transition = ALLOWED_TRANSITIONS[action];
  if (!transition.from.includes(product.status)) {
    throw new InvalidStatusTransitionError(`لا يمكن تنفيذ هذا الإجراء والمنتج في حالة "${product.status}"`);
  }

  return db.product.update({
    where: { id: productId },
    data: {
      status: transition.to as never,
      publishedAt: transition.to === "LIVE" && !product.publishedAt ? new Date() : product.publishedAt,
    },
  });
}
