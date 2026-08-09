import type { BadgeProps } from "@/components/ui/badge";
import type {
  AiJobStatus,
  DisputeStatus,
  OrderStatus,
  ProductStatus,
  QuoteStatus,
  RfqStatus,
  VerificationStatus,
} from "@/generated/prisma/client";

type StatusMeta = { labelAr: string; labelEn: string; variant: NonNullable<BadgeProps["variant"]> };

export const PRODUCT_STATUS_META: Record<ProductStatus, StatusMeta> = {
  DRAFT: { labelAr: "مسودة", labelEn: "Draft", variant: "default" },
  PENDING_REVIEW: { labelAr: "قيد المراجعة", labelEn: "Pending Review", variant: "warning" },
  LIVE: { labelAr: "منشور", labelEn: "Live", variant: "success" },
  PAUSED: { labelAr: "متوقف مؤقتًا", labelEn: "Paused", variant: "info" },
  REJECTED: { labelAr: "مرفوض", labelEn: "Rejected", variant: "destructive" },
  ARCHIVED: { labelAr: "مؤرشف", labelEn: "Archived", variant: "outline" },
};

export const RFQ_STATUS_META: Record<RfqStatus, StatusMeta> = {
  SUBMITTED: { labelAr: "تم الإرسال", labelEn: "Submitted", variant: "info" },
  VIEWED: { labelAr: "تمت المشاهدة", labelEn: "Viewed", variant: "info" },
  QUOTED: { labelAr: "تم التسعير", labelEn: "Quoted", variant: "gold" },
  NEGOTIATING: { labelAr: "قيد التفاوض", labelEn: "Negotiating", variant: "warning" },
  ACCEPTED: { labelAr: "مقبول", labelEn: "Accepted", variant: "success" },
  DECLINED: { labelAr: "مرفوض", labelEn: "Declined", variant: "destructive" },
  EXPIRED: { labelAr: "منتهي", labelEn: "Expired", variant: "outline" },
  CANCELLED: { labelAr: "ملغى", labelEn: "Cancelled", variant: "outline" },
};

export const QUOTE_STATUS_META: Record<QuoteStatus, StatusMeta> = {
  PENDING: { labelAr: "بانتظار الرد", labelEn: "Pending", variant: "warning" },
  ACCEPTED: { labelAr: "مقبول", labelEn: "Accepted", variant: "success" },
  REJECTED: { labelAr: "مرفوض", labelEn: "Rejected", variant: "destructive" },
  SUPERSEDED: { labelAr: "تم استبداله", labelEn: "Superseded", variant: "outline" },
};

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  CONFIRMED: { labelAr: "تم التأكيد", labelEn: "Confirmed", variant: "info" },
  IN_PRODUCTION: { labelAr: "قيد الإنتاج", labelEn: "In Production", variant: "warning" },
  READY_TO_SHIP: { labelAr: "جاهز للشحن", labelEn: "Ready to Ship", variant: "warning" },
  SHIPPED: { labelAr: "تم الشحن", labelEn: "Shipped", variant: "gold" },
  DELIVERED: { labelAr: "تم التسليم", labelEn: "Delivered", variant: "success" },
  COMPLETED: { labelAr: "مكتمل", labelEn: "Completed", variant: "success" },
  CANCELLED: { labelAr: "ملغى", labelEn: "Cancelled", variant: "outline" },
  DISPUTED: { labelAr: "نزاع", labelEn: "Disputed", variant: "destructive" },
};

export const VERIFICATION_STATUS_META: Record<VerificationStatus, StatusMeta> = {
  PENDING: { labelAr: "قيد المراجعة", labelEn: "Pending", variant: "warning" },
  VERIFIED: { labelAr: "موثّق", labelEn: "Verified", variant: "success" },
  REJECTED: { labelAr: "مرفوض", labelEn: "Rejected", variant: "destructive" },
};

export const AI_JOB_STATUS_META: Record<AiJobStatus, StatusMeta> = {
  QUEUED: { labelAr: "في الانتظار", labelEn: "Queued", variant: "default" },
  PROCESSING: { labelAr: "قيد المعالجة", labelEn: "Processing", variant: "info" },
  COMPLETED: { labelAr: "مكتمل", labelEn: "Completed", variant: "success" },
  FAILED: { labelAr: "فشل", labelEn: "Failed", variant: "destructive" },
};

export const DISPUTE_STATUS_META: Record<DisputeStatus, StatusMeta> = {
  OPEN: { labelAr: "مفتوح", labelEn: "Open", variant: "warning" },
  INVESTIGATING: { labelAr: "قيد التحقيق", labelEn: "Investigating", variant: "info" },
  RESOLVED: { labelAr: "تم الحل", labelEn: "Resolved", variant: "success" },
  REJECTED: { labelAr: "مرفوض", labelEn: "Rejected", variant: "destructive" },
};

/** The order lifecycle in display sequence, for the status timeline/stepper (UIUX #C.9). */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];
