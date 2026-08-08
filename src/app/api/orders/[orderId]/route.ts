import { auth } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { OrderNotFoundError, getOrderDetail } from "@/server/services/order.service";

export async function GET(_request: Request, ctx: RouteContext<"/api/orders/[orderId]">) {
  const session = await auth();
  if (!session?.user.organization) return apiError("forbidden", "يجب تسجيل الدخول كمنشأة", 403);

  const { orderId } = await ctx.params;
  try {
    const order = await getOrderDetail(session.user.organization.id, orderId);
    return apiOk(order);
  } catch (error) {
    if (error instanceof OrderNotFoundError) return apiError("not_found", "الطلب غير موجود", 404);
    throw error;
  }
}
