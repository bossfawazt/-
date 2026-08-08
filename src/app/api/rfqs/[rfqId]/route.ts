import { auth } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { RfqNotFoundError, getRfqDetail } from "@/server/services/rfq.service";

export async function GET(_request: Request, ctx: RouteContext<"/api/rfqs/[rfqId]">) {
  const session = await auth();
  if (!session?.user.organization) return apiError("forbidden", "يجب تسجيل الدخول كمنشأة", 403);

  const { rfqId } = await ctx.params;
  try {
    const rfq = await getRfqDetail(session.user.organization.id, rfqId);
    return apiOk(rfq);
  } catch (error) {
    if (error instanceof RfqNotFoundError) return apiError("not_found", "طلب الشراء غير موجود", 404);
    throw error;
  }
}
