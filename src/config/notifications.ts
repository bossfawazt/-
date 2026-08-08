/** Event types actually emitted by src/server/services/*.service.ts notify()/notifyOrganization() calls. */
export const NOTIFICATION_EVENT_TYPES = [
  { key: "rfq.created", labelAr: "طلب شراء جديد" },
  { key: "rfq.message", labelAr: "رسالة جديدة في طلب شراء" },
  { key: "quote.created", labelAr: "عرض سعر جديد" },
  { key: "quote.accepted", labelAr: "قبول عرض السعر" },
  { key: "quote.declined", labelAr: "رفض عرض السعر" },
  { key: "order.status_changed", labelAr: "تحديث حالة الطلب" },
  { key: "review.created", labelAr: "تقييم جديد" },
] as const;

export type NotificationEventKey = (typeof NOTIFICATION_EVENT_TYPES)[number]["key"];

export const NOTIFICATION_CHANNELS = [
  { key: "IN_APP", labelAr: "داخل التطبيق" },
  { key: "SMS", labelAr: "رسالة نصية" },
  { key: "WHATSAPP", labelAr: "واتساب" },
  { key: "EMAIL", labelAr: "بريد إلكتروني" },
] as const;

export type NotificationChannelKey = (typeof NOTIFICATION_CHANNELS)[number]["key"];

/** Requests & Orders is the only populated group today; Account & System is reserved for verification/system events (docs/ARCHITECTURE-touq.md #7). */
export function notificationGroup(eventType: string): "orders" | "system" {
  return eventType.startsWith("rfq.") || eventType.startsWith("quote.") || eventType.startsWith("order.") || eventType.startsWith("review.")
    ? "orders"
    : "system";
}
