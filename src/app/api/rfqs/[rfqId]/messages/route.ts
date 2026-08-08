import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { createMessageSchema } from "@/lib/validations/rfq";
import { RfqNotFoundError, addRfqMessage } from "@/server/services/rfq.service";

export async function POST(request: Request, ctx: RouteContext<"/api/rfqs/[rfqId]/messages">) {
  const session = await auth();
  if (!session?.user.organization) return apiError("forbidden", "يجب تسجيل الدخول كمنشأة", 403);

  const { rfqId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const message = await addRfqMessage(session.user.organization.id, rfqId, session.user.id, parsed.data.body);
    return apiOk(message, 201);
  } catch (error) {
    if (error instanceof RfqNotFoundError) return apiError("not_found", "طلب الشراء غير موجود", 404);
    throw error;
  }
}
