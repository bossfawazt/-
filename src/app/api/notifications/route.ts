import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 8), 50);
  const unreadOnly = searchParams.get("unread") === "true";

  const [items, unreadCount] = await Promise.all([
    db.notificationEvent.findMany({
      where: {
        userId: session.user.id,
        channel: "IN_APP",
        ...(unreadOnly ? { status: { not: "READ" } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    db.notificationEvent.count({
      where: { userId: session.user.id, channel: "IN_APP", status: { not: "READ" } },
    }),
  ]);

  return apiOk({ items, unreadCount });
}
