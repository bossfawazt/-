import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { createDisputeSchema } from "@/lib/validations/rfq";
import { OrderNotFoundError, raiseDispute } from "@/server/services/order.service";

export async function POST(request: Request, ctx: RouteContext<"/api/orders/[orderId]/dispute">) {
  const session = await auth();
  if (!session?.user.organization) return apiError("forbidden", "يجب تسجيل الدخول كمنشأة", 403);

  const { orderId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createDisputeSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    await raiseDispute(session.user.organization.id, session.user.id, orderId, parsed.data);
    return apiOk({ ok: true }, 201);
  } catch (error) {
    if (error instanceof OrderNotFoundError) return apiError("not_found", "الطلب غير موجود", 404);
    throw error;
  }
}
