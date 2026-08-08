import { db } from "@/lib/db";

/**
 * Minimal in-app notification emitter. Stands in for the full
 * event-bus-driven Notification Service from docs/ARCHITECTURE-touq.md #12
 * (SMS/WhatsApp channel adapters are a deferred future integration,
 * matching the dev-console OTP delivery in src/lib/otp.ts) — every call
 * site here is where a real channel fan-out would plug in later.
 */
export async function notify(params: {
  userId: string;
  eventType: string;
  title: string;
  body: string;
  linkUrl?: string;
}) {
  await db.notificationEvent.create({
    data: {
      userId: params.userId,
      eventType: params.eventType,
      channel: "IN_APP",
      title: params.title,
      body: params.body,
      linkUrl: params.linkUrl,
      status: "SENT",
      sentAt: new Date(),
    },
  });
}

/** Notifies every active member of an organization (usually just the owner at MVP scope). */
export async function notifyOrganization(params: {
  organizationId: string;
  eventType: string;
  title: string;
  body: string;
  linkUrl?: string;
}) {
  const members = await db.organizationMember.findMany({
    where: { organizationId: params.organizationId, status: "ACTIVE" },
    select: { userId: true },
  });
  await Promise.all(members.map((m) => notify({ ...params, userId: m.userId })));
}
