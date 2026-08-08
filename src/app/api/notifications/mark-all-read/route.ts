import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/api-response";

export async function POST() {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const result = await db.notificationEvent.updateMany({
    where: { userId: session.user.id, channel: "IN_APP", status: { not: "READ" } },
    data: { status: "READ", readAt: new Date() },
  });

  return apiOk({ updated: result.count });
}
