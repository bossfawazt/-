import { db } from "@/lib/db";
import type { CreateReviewInput, CreateDisputeInput } from "@/lib/validations/rfq";
import { notifyOrganization } from "@/server/services/notification.service";
import type { OrderStatus } from "@/generated/prisma/client";

export class OrderNotFoundError extends Error {
  constructor() {
    super("order_not_found");
  }
}
export class InvalidOrderTransitionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const ORDER_INCLUDE = {
  merchant: { select: { id: true, legalNameAr: true } },
  supplier: { select: { id: true, legalNameAr: true, verificationStatus: true } },
  items: { include: { variant: { include: { product: { select: { id: true, titleAr: true } } } } } },
  statusHistory: { orderBy: { createdAt: "asc" as const }, include: { changedBy: { select: { name: true } } } },
  review: true,
  dispute: true,
} as const;

export async function listOrdersForOrganization(organizationId: string, role: "MERCHANT" | "SUPPLIER") {
  return db.order.findMany({
    where: role === "MERCHANT" ? { merchantId: organizationId } : { supplierId: organizationId },
    orderBy: { createdAt: "desc" },
    include: ORDER_INCLUDE,
  });
}

export async function getOrderDetail(organizationId: string, orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
  if (!order || (order.merchantId !== organizationId && order.supplierId !== organizationId)) {
    throw new OrderNotFoundError();
  }
  return order;
}

type Action = "mark_in_production" | "mark_ready_to_ship" | "mark_shipped" | "confirm_delivery" | "cancel";

const TRANSITIONS: Record<Action, { role: "SUPPLIER" | "MERCHANT" | "EITHER"; from: OrderStatus[]; to: OrderStatus }> = {
  mark_in_production: { role: "SUPPLIER", from: ["CONFIRMED"], to: "IN_PRODUCTION" },
  mark_ready_to_ship: { role: "SUPPLIER", from: ["IN_PRODUCTION"], to: "READY_TO_SHIP" },
  mark_shipped: { role: "SUPPLIER", from: ["READY_TO_SHIP"], to: "SHIPPED" },
  confirm_delivery: { role: "MERCHANT", from: ["SHIPPED"], to: "DELIVERED" },
  cancel: { role: "EITHER", from: ["CONFIRMED"], to: "CANCELLED" },
};

/** docs/ARCHITECTURE-touq.md #11 order lifecycle — role-gated status transitions with a full audit trail. */
export async function changeOrderStatus(
  organizationId: string,
  role: "MERCHANT" | "SUPPLIER",
  userId: string,
  orderId: string,
  action: Action,
  note?: string,
) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || (order.merchantId !== organizationId && order.supplierId !== organizationId)) {
    throw new OrderNotFoundError();
  }

  const transition = TRANSITIONS[action];
  if (transition.role !== "EITHER" && transition.role !== role) {
    throw new InvalidOrderTransitionError("لا يمكنك تنفيذ هذا الإجراء");
  }
  if (!transition.from.includes(order.status)) {
    throw new InvalidOrderTransitionError(`لا يمكن تنفيذ هذا الإجراء والطلب في حالة "${order.status}"`);
  }

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.order.update({ where: { id: orderId }, data: { status: transition.to } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: order.status, toStatus: transition.to, changedByUserId: userId, note: note || null },
    });
    return result;
  });

  const counterpartyOrgId = role === "MERCHANT" ? order.supplierId : order.merchantId;
  await notifyOrganization({
    organizationId: counterpartyOrgId,
    eventType: "order.status_changed",
    title: "تحديث حالة الطلب",
    body: `تم تحديث حالة الطلب إلى "${transition.to}".`,
    linkUrl: role === "MERCHANT" ? `/supplier/orders/${orderId}` : `/merchant/orders/${orderId}`,
  });

  return updated;
}

/** Merchant leaves a review; per docs/UIUX-touq.md the Delivered -> Completed transition happens on rating. */
export async function leaveReview(merchantId: string, userId: string, orderId: string, input: CreateReviewInput) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.merchantId !== merchantId) throw new OrderNotFoundError();
  if (order.status !== "DELIVERED") {
    throw new InvalidOrderTransitionError("يمكن تقييم الطلب بعد تأكيد الاستلام فقط");
  }

  const existing = await db.review.findUnique({ where: { orderId } });
  if (existing) throw new InvalidOrderTransitionError("تم تقييم هذا الطلب مسبقًا");

  await db.$transaction(async (tx) => {
    await tx.review.create({
      data: { orderId, merchantId, supplierId: order.supplierId, rating: input.rating, comment: input.comment || null },
    });
    await tx.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: "DELIVERED", toStatus: "COMPLETED", changedByUserId: userId, note: "تم إغلاق الطلب بعد التقييم." },
    });

    const agg = await tx.review.aggregate({ where: { supplierId: order.supplierId }, _avg: { rating: true }, _count: true });
    await tx.organization.update({
      where: { id: order.supplierId },
      data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
    });
  });

  await notifyOrganization({
    organizationId: order.supplierId,
    eventType: "review.created",
    title: "تقييم جديد",
    body: `حصلت على تقييم ${input.rating} من 5.`,
    linkUrl: `/supplier/orders/${orderId}`,
  });
}

export async function raiseDispute(organizationId: string, userId: string, orderId: string, input: CreateDisputeInput) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || (order.merchantId !== organizationId && order.supplierId !== organizationId)) {
    throw new OrderNotFoundError();
  }

  await db.$transaction([
    db.dispute.create({ data: { orderId, raisedByUserId: userId, reason: input.reason, status: "OPEN" } }),
    db.order.update({ where: { id: orderId }, data: { status: "DISPUTED" } }),
  ]);
}
