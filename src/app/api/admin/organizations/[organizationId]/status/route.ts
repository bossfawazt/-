import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/rbac";
import { AdminActionError, reinstateOrganization, suspendOrganization } from "@/server/services/admin.service";

const statusSchema = z.object({ action: z.enum(["suspend", "reinstate"]) });

export async function POST(request: Request, ctx: RouteContext<"/api/admin/organizations/[organizationId]/status">) {
  const guard = await requireAdmin(PERMISSIONS.ORG_VERIFY);
  if ("error" in guard) return guard.error;

  const { organizationId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    if (parsed.data.action === "suspend") {
      await suspendOrganization(organizationId, guard.userId);
    } else {
      await reinstateOrganization(organizationId, guard.userId);
    }
    return apiOk({ ok: true });
  } catch (error) {
    if (error instanceof AdminActionError) return apiError("not_found", error.message, 404);
    throw error;
  }
}
