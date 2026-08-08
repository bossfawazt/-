import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/api-response";

export async function PATCH(request: Request, ctx: RouteContext<"/api/notifications/[notificationId]">) {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const { notificationId } = await ctx.params;
  const notification = await db.notificationEvent.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== session.user.id) {
    return apiError("not_found", "الإشعار غير موجود", 404);
  }

  const updated = await db.notificationEvent.update({
    where: { id: notificationId },
    data: { status: "READ", readAt: new Date() },
  });

  return apiOk(updated);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/notifications/[notificationId]">) {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const { notificationId } = await ctx.params;
  const notification = await db.notificationEvent.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== session.user.id) {
    return apiError("not_found", "الإشعار غير موجود", 404);
  }

  await db.notificationEvent.delete({ where: { id: notificationId } });
  return apiOk({ ok: true });
}
