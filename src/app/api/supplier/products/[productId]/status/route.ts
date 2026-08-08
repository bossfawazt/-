import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { productStatusActionSchema } from "@/lib/validations/product";
import { InvalidStatusTransitionError, ProductNotFoundError, changeProductStatus } from "@/server/services/product.service";

/** docs/ARCHITECTURE-touq.md #10 product lifecycle — supplier-triggered transitions. */
export async function POST(request: Request, ctx: RouteContext<"/api/supplier/products/[productId]/status">) {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const { productId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = productStatusActionSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const product = await changeProductStatus(session.user.organization!.id, productId, parsed.data.action);
    return apiOk(product);
  } catch (error) {
    if (error instanceof ProductNotFoundError) return apiError("not_found", "المنتج غير موجود", 404);
    if (error instanceof InvalidStatusTransitionError) return apiError("invalid_transition", error.message, 409);
    throw error;
  }
}
