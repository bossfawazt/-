import { db } from "@/lib/db";
import type { CreateQuoteInput, CreateRfqInput } from "@/lib/validations/rfq";
import { notifyOrganization } from "@/server/services/notification.service";

export class RfqNotFoundError extends Error {
  constructor() {
    super("rfq_not_found");
  }
}
export class QuoteNotFoundError extends Error {
  constructor() {
    super("quote_not_found");
  }
}
export class InvalidRfqStateError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/** docs/UIUX-touq.md #C.7/#C.9: merchant sends a purchase request against a product/variant or directly to a supplier. */
export async function createRfq(merchantId: string, userId: string, input: CreateRfqInput) {
  const rfq = await db.rfq.create({
    data: {
      merchantId,
      supplierId: input.supplierId,
      productId: input.productId,
      variantId: input.variantId,
      requestedQty: input.requestedQty,
      targetPriceMinor: input.targetPriceSar ? Math.round(input.targetPriceSar * 100) : null,
      customizationNotes: input.customizationNotes || null,
      status: "SUBMITTED",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    include: { merchant: true, product: true },
  });

  await notifyOrganization({
    organizationId: input.supplierId,
    eventType: "rfq.created",
    title: "طلب شراء جديد",
    body: `أرسل ${rfq.merchant.legalNameAr} طلب شراء${rfq.product ? ` لـ${rfq.product.titleAr}` : ""}.`,
    linkUrl: `/supplier/rfqs/${rfq.id}`,
  });

  return rfq;
}

const RFQ_INCLUDE = {
  merchant: { select: { id: true, legalNameAr: true, ratingAvg: true, ratingCount: true } },
  supplier: { select: { id: true, legalNameAr: true, verificationStatus: true, ratingAvg: true, ratingCount: true } },
  product: { select: { id: true, titleAr: true } },
  variant: true,
  messages: { orderBy: { createdAt: "asc" as const }, include: { sender: { select: { id: true, name: true } } } },
  quotes: { orderBy: { createdAt: "desc" as const } },
} as const;

export async function listRfqsForOrganization(organizationId: string, role: "MERCHANT" | "SUPPLIER") {
  return db.rfq.findMany({
    where: role === "MERCHANT" ? { merchantId: organizationId } : { supplierId: organizationId },
    orderBy: { createdAt: "desc" },
    include: RFQ_INCLUDE,
  });
}

export async function getRfqDetail(organizationId: string, rfqId: string) {
  const rfq = await db.rfq.findUnique({ where: { id: rfqId }, include: RFQ_INCLUDE });
  if (!rfq || (rfq.merchantId !== organizationId && rfq.supplierId !== organizationId)) {
    throw new RfqNotFoundError();
  }

  if (rfq.supplierId === organizationId && rfq.status === "SUBMITTED") {
    await db.rfq.update({ where: { id: rfqId }, data: { status: "VIEWED" } });
    rfq.status = "VIEWED";
  }

  return rfq;
}

async function assertParticipant(rfqId: string, organizationId: string) {
  const rfq = await db.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq || (rfq.merchantId !== organizationId && rfq.supplierId !== organizationId)) {
    throw new RfqNotFoundError();
  }
  return rfq;
}

export async function addRfqMessage(organizationId: string, rfqId: string, userId: string, body: string) {
  const rfq = await assertParticipant(rfqId, organizationId);

  const message = await db.rfqMessage.create({
    data: { rfqId, senderUserId: userId, body },
    include: { sender: { select: { id: true, name: true } } },
  });

  if (rfq.status === "QUOTED") {
    await db.rfq.update({ where: { id: rfqId }, data: { status: "NEGOTIATING" } });
  }

  const recipientOrgId = organizationId === rfq.merchantId ? rfq.supplierId : rfq.merchantId;
  await notifyOrganization({
    organizationId: recipientOrgId,
    eventType: "rfq.message",
    title: "رسالة جديدة",
    body: body.slice(0, 120),
    linkUrl: organizationId === rfq.merchantId ? `/supplier/rfqs/${rfqId}` : `/merchant/requests/${rfqId}`,
  });

  return message;
}

/** Supplier quotes (or re-quotes, superseding the previous pending quote) against an RFQ. */
export async function createQuote(supplierId: string, rfqId: string, input: CreateQuoteInput) {
  const rfq = await db.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq || rfq.supplierId !== supplierId) throw new RfqNotFoundError();
  if (!["SUBMITTED", "VIEWED", "QUOTED", "NEGOTIATING"].includes(rfq.status)) {
    throw new InvalidRfqStateError(`لا يمكن إرسال عرض سعر وطلب الشراء في حالة "${rfq.status}"`);
  }

  const [, quote] = await db.$transaction([
    db.quote.updateMany({
      where: { rfqId, status: "PENDING" },
      data: { status: "SUPERSEDED" },
    }),
    db.quote.create({
      data: {
        rfqId,
        supplierId,
        quotedQty: input.quotedQty,
        quotedUnitPriceMinor: Math.round(input.quotedUnitPriceSar * 100),
        leadTimeDays: input.leadTimeDays,
        validUntil: new Date(Date.now() + input.validForDays * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    }),
    db.rfq.update({ where: { id: rfqId }, data: { status: "QUOTED" } }),
  ]);

  await notifyOrganization({
    organizationId: rfq.merchantId,
    eventType: "quote.created",
    title: "عرض سعر جديد",
    body: `استلمت عرض سعر جديد على طلب الشراء الخاص بك.`,
    linkUrl: `/merchant/requests/${rfqId}`,
  });

  return quote;
}

export async function acceptQuote(merchantId: string, userId: string, quoteId: string) {
  const quote = await db.quote.findUnique({ where: { id: quoteId }, include: { rfq: true } });
  if (!quote || quote.rfq.merchantId !== merchantId) throw new QuoteNotFoundError();
  if (quote.status !== "PENDING") throw new InvalidRfqStateError("هذا العرض لم يعد ساريًا");
  if (quote.validUntil < new Date()) throw new InvalidRfqStateError("انتهت صلاحية هذا العرض");
  if (!quote.rfq.variantId) throw new InvalidRfqStateError("لا يمكن إنشاء طلب بدون تحديد متغير المنتج");

  const totalAmountMinor = quote.quotedUnitPriceMinor * quote.quotedQty;

  const order = await db.$transaction(async (tx) => {
    await tx.quote.update({ where: { id: quoteId }, data: { status: "ACCEPTED" } });
    await tx.rfq.update({ where: { id: quote.rfqId }, data: { status: "ACCEPTED" } });

    return tx.order.create({
      data: {
        rfqId: quote.rfqId,
        quoteId: quote.id,
        merchantId,
        supplierId: quote.supplierId,
        status: "CONFIRMED",
        totalAmountMinor,
        items: {
          create: {
            variantId: quote.rfq.variantId!,
            qty: quote.quotedQty,
            unitPriceMinor: quote.quotedUnitPriceMinor,
            subtotalMinor: totalAmountMinor,
          },
        },
        statusHistory: {
          create: { toStatus: "CONFIRMED", changedByUserId: userId, note: "تم إنشاء الطلب من عرض السعر المقبول." },
        },
      },
    });
  });

  await notifyOrganization({
    organizationId: quote.supplierId,
    eventType: "quote.accepted",
    title: "تم قبول عرض السعر",
    body: "وافق التاجر على عرض السعر، تم إنشاء طلب جديد.",
    linkUrl: `/supplier/orders/${order.id}`,
  });

  return order;
}

export async function declineQuote(merchantId: string, quoteId: string) {
  const quote = await db.quote.findUnique({ where: { id: quoteId }, include: { rfq: true } });
  if (!quote || quote.rfq.merchantId !== merchantId) throw new QuoteNotFoundError();
  if (quote.status !== "PENDING") throw new InvalidRfqStateError("هذا العرض لم يعد ساريًا");

  await db.$transaction([
    db.quote.update({ where: { id: quoteId }, data: { status: "REJECTED" } }),
    db.rfq.update({ where: { id: quote.rfqId }, data: { status: "DECLINED" } }),
  ]);

  await notifyOrganization({
    organizationId: quote.supplierId,
    eventType: "quote.declined",
    title: "تم رفض عرض السعر",
    body: "رفض التاجر عرض السعر المرسل.",
    linkUrl: `/supplier/rfqs/${quote.rfqId}`,
  });
}
