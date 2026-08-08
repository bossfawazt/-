import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { notificationPreferencesSchema } from "@/lib/validations/settings";
import { NOTIFICATION_CHANNELS, NOTIFICATION_EVENT_TYPES } from "@/config/notifications";

/** docs/UIUX-touq.md #C.13: event type x channel toggle matrix. Missing rows default to enabled for IN_APP only. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const rows = await db.notificationPreference.findMany({ where: { userId: session.user.id } });
  const overrides = new Map(rows.map((r) => [`${r.eventType}:${r.channel}`, r.enabled]));

  const preferences = NOTIFICATION_EVENT_TYPES.flatMap((event) =>
    NOTIFICATION_CHANNELS.map((channel) => ({
      eventType: event.key,
      channel: channel.key,
      enabled: overrides.get(`${event.key}:${channel.key}`) ?? channel.key === "IN_APP",
    })),
  );

  return apiOk(preferences);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const body = await request.json().catch(() => null);
  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const userId = session.user.id;
  await db.$transaction(
    parsed.data.preferences.map((p) =>
      db.notificationPreference.upsert({
        where: { userId_eventType_channel: { userId, eventType: p.eventType, channel: p.channel } },
        create: { userId, eventType: p.eventType, channel: p.channel, enabled: p.enabled },
        update: { enabled: p.enabled },
      }),
    ),
  );

  return apiOk({ ok: true });
}
