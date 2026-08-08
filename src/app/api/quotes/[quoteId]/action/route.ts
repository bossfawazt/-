import { z } from "zod";
import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { InvalidRfqStateError, QuoteNotFoundError, acceptQuote, declineQuote } from "@/server/services/rfq.service";

const actionSchema = z.object({ action: z.enum(["accept", "decline"]) });

/** docs/UIUX-touq.md #C.9: merchant accepts (-> creates an Order) or declines a quote. */
export async function POST(request: Request, ctx: RouteContext<"/api/quotes/[quoteId]/action">) {
  const session = await auth();
  if (session?.user.organization?.type !== "MERCHANT") return apiError("forbidden", "متاح للتجار فقط", 403);

  const { quoteId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    if (parsed.data.action === "accept") {
      const order = await acceptQuote(session.user.organization.id, session.user.id, quoteId);
      return apiOk(order, 201);
    }
    await declineQuote(session.user.organization.id, quoteId);
    return apiOk({ ok: true });
  } catch (error) {
    if (error instanceof QuoteNotFoundError) return apiError("not_found", "عرض السعر غير موجود", 404);
    if (error instanceof InvalidRfqStateError) return apiError("invalid_state", error.message, 409);
    throw error;
  }
}
