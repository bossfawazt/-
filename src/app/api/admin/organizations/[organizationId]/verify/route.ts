import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/rbac";
import { AdminActionError, approveOrganization, rejectOrganization } from "@/server/services/admin.service";

const verifySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), reason: z.string().trim().min(5, "سبب الرفض مطلوب") }),
]);

export async function POST(request: Request, ctx: RouteContext<"/api/admin/organizations/[organizationId]/verify">) {
  const guard = await requireAdmin(PERMISSIONS.ORG_VERIFY);
  if ("error" in guard) return guard.error;

  const { organizationId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    if (parsed.data.action === "approve") {
      await approveOrganization(organizationId, guard.userId);
    } else {
      await rejectOrganization(organizationId, guard.userId, parsed.data.reason);
    }
    return apiOk({ ok: true });
  } catch (error) {
    if (error instanceof AdminActionError) return apiError("not_found", error.message, 404);
    throw error;
  }
}
