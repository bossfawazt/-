import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/rbac";
import { AdminActionError, approveProduct, rejectProduct } from "@/server/services/admin.service";

const moderateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), reason: z.string().trim().min(5, "سبب الرفض مطلوب") }),
]);

export async function POST(request: Request, ctx: RouteContext<"/api/admin/products/[productId]/moderate">) {
  const guard = await requireAdmin(PERMISSIONS.PRODUCT_MODERATE);
  if ("error" in guard) return guard.error;

  const { productId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = moderateSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    if (parsed.data.action === "approve") {
      await approveProduct(productId, guard.userId);
    } else {
      await rejectProduct(productId, guard.userId, parsed.data.reason);
    }
    return apiOk({ ok: true });
  } catch (error) {
    if (error instanceof AdminActionError) return apiError("not_found", error.message, 404);
    throw error;
  }
}
