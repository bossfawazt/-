import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { createReviewSchema } from "@/lib/validations/rfq";
import { InvalidOrderTransitionError, OrderNotFoundError, leaveReview } from "@/server/services/order.service";

export async function POST(request: Request, ctx: RouteContext<"/api/orders/[orderId]/review">) {
  const session = await auth();
  if (session?.user.organization?.type !== "MERCHANT") return apiError("forbidden", "متاح للتجار فقط", 403);

  const { orderId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    await leaveReview(session.user.organization.id, session.user.id, orderId, parsed.data);
    return apiOk({ ok: true }, 201);
  } catch (error) {
    if (error instanceof OrderNotFoundError) return apiError("not_found", "الطلب غير موجود", 404);
    if (error instanceof InvalidOrderTransitionError) return apiError("invalid_state", error.message, 409);
    throw error;
  }
}
