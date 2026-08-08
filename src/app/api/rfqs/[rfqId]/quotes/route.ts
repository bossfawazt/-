import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { createQuoteSchema } from "@/lib/validations/rfq";
import { InvalidRfqStateError, RfqNotFoundError, createQuote } from "@/server/services/rfq.service";

/** docs/UIUX-touq.md #C.9: supplier responds to an RFQ with a formal quote. */
export async function POST(request: Request, ctx: RouteContext<"/api/rfqs/[rfqId]/quotes">) {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const { rfqId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createQuoteSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const quote = await createQuote(session.user.organization.id, rfqId, parsed.data);
    return apiOk(quote, 201);
  } catch (error) {
    if (error instanceof RfqNotFoundError) return apiError("not_found", "طلب الشراء غير موجود", 404);
    if (error instanceof InvalidRfqStateError) return apiError("invalid_state", error.message, 409);
    throw error;
  }
}
