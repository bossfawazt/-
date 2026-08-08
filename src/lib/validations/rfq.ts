import { z } from "zod";

/** docs/UIUX-touq.md #C.9 RFQ Builder + negotiation + quote schemas. */

export const createRfqSchema = z.object({
  supplierId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  requestedQty: z.number().int().min(1, "الكمية 1 على الأقل"),
  targetPriceSar: z.number().positive().optional(),
  customizationNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type CreateRfqInput = z.infer<typeof createRfqSchema>;

export const createMessageSchema = z.object({
  body: z.string().trim().min(1, "اكتب رسالة").max(2000),
});
export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const createQuoteSchema = z.object({
  quotedQty: z.number().int().min(1, "الكمية 1 على الأقل"),
  quotedUnitPriceSar: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  leadTimeDays: z.number().int().min(1, "مدة التوريد يوم واحد على الأقل"),
  validForDays: z.number().int().min(1).max(30),
});
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export const orderStatusActionSchema = z.object({
  action: z.enum(["mark_in_production", "mark_ready_to_ship", "mark_shipped", "confirm_delivery", "cancel"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type OrderStatusActionInput = z.infer<typeof orderStatusActionSchema>;

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createDisputeSchema = z.object({
  reason: z.string().trim().min(10, "اشرح سبب النزاع").max(1000),
});
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
