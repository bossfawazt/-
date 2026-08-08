import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { orderStatusActionSchema } from "@/lib/validations/rfq";
import { InvalidOrderTransitionError, OrderNotFoundError, changeOrderStatus } from "@/server/services/order.service";

export async function POST(request: Request, ctx: RouteContext<"/api/orders/[orderId]/status">) {
  const session = await auth();
  if (!session?.user.organization) return apiError("forbidden", "يجب تسجيل الدخول كمنشأة", 403);

  const { orderId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = orderStatusActionSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const order = await changeOrderStatus(
      session.user.organization.id,
      session.user.organization.type,
      session.user.id,
      orderId,
      parsed.data.action,
      parsed.data.note,
    );
    return apiOk(order);
  } catch (error) {
    if (error instanceof OrderNotFoundError) return apiError("not_found", "الطلب غير موجود", 404);
    if (error instanceof InvalidOrderTransitionError) return apiError("invalid_transition", error.message, 409);
    throw error;
  }
}
