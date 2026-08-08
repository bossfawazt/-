import { z } from "zod";

/**
 * Product create/edit schemas — shared by the supplier catalog form
 * (React Hook Form + zodResolver) and the /api/supplier/products route
 * handlers, per the same client/server validation-parity rule as
 * src/lib/validations/auth.ts.
 */

// Numeric fields deliberately use z.number() rather than z.coerce.number():
// coercion splits a schema's input/output types (input = unknown pre-coerce),
// which breaks useForm<ProductFormInput>'s resolver typing. Inputs instead
// parse to a number explicitly via valueAsNumber (see variant-field.tsx),
// keeping the form's input and output types identical throughout.
export const pricingTierSchema = z
  .object({
    minQty: z.number().int().min(1, "الكمية 1 على الأقل"),
    maxQty: z.number().int().min(1).optional().nullable(),
    unitPriceSar: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  })
  .refine((tier) => !tier.maxQty || tier.maxQty >= tier.minQty, {
    error: "الحد الأقصى يجب أن يكون أكبر من أو يساوي الحد الأدنى",
    path: ["maxQty"],
  });

export const variantSchema = z.object({
  id: z.string().optional(), // present when editing an existing variant
  color: z.string().trim().max(50).optional().or(z.literal("")),
  size: z.string().trim().max(50).optional().or(z.literal("")),
  moq: z.number().int().min(1, "الحد الأدنى للطلب 1 على الأقل"),
  leadTimeDays: z.number().int().min(1, "مدة التوريد يوم واحد على الأقل"),
  stockStatus: z.enum(["IN_STOCK", "MADE_TO_ORDER", "OUT_OF_STOCK"]),
  pricingTiers: z.array(pricingTierSchema).min(1, "أضف مستوى تسعير واحد على الأقل"),
});

export const productAttributesSchema = z.object({
  fabric: z.string().min(1, "اختر القماش"),
  style: z.string().min(1, "اختر القصة"),
  sleeve: z.string().min(1, "اختر نوع الأكمام"),
  color: z.string().min(1, "اختر اللون"),
  embroidery: z.string().min(1, "اختر التطريز"),
  category: z.string().min(1, "اختر التصنيف"),
  season: z.string().min(1, "اختر الموسم"),
});

export const productMediaSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean(),
});

export const productFormSchema = z.object({
  titleAr: z.string().trim().min(3, "العنوان قصير جدًا").max(150),
  titleEn: z.string().trim().max(150).optional().or(z.literal("")),
  descriptionAr: z.string().trim().max(2000).optional().or(z.literal("")),
  attributes: productAttributesSchema,
  media: z.array(productMediaSchema).min(1, "أضف صورة واحدة على الأقل"),
  variants: z.array(variantSchema).min(1, "أضف متغيرًا واحدًا على الأقل (لون/مقاس)"),
});
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const productStatusActionSchema = z.object({
  action: z.enum(["submit_for_review", "pause", "resume", "archive"]),
});
