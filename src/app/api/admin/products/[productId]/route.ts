import { requireAdmin } from "@/lib/admin-guard";
import { apiError, apiOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/rbac";
import { AdminActionError, deleteProduct } from "@/server/services/admin.service";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/products/[productId]">) {
  const guard = await requireAdmin(PERMISSIONS.PLATFORM_CONFIG);
  if ("error" in guard) return guard.error;

  const { productId } = await ctx.params;
  try {
    await deleteProduct(productId, guard.userId);
    return apiOk({ ok: true });
  } catch (error) {
    if (error instanceof AdminActionError) return apiError("not_found", error.message, 404);
    throw error;
  }
}
