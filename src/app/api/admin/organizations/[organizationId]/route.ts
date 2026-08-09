import { requireAdmin } from "@/lib/admin-guard";
import { apiError, apiOk } from "@/lib/api-response";
import { getOrganizationDetail } from "@/server/services/admin.service";

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/organizations/[organizationId]">) {
  const guard = await requireAdmin("any");
  if ("error" in guard) return guard.error;

  const { organizationId } = await ctx.params;
  const detail = await getOrganizationDetail(organizationId);
  if (!detail) return apiError("not_found", "المنشأة غير موجودة", 404);

  return apiOk(detail);
}
