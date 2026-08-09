import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/rbac";
import { AdminActionError, resolveDispute } from "@/server/services/admin.service";

const resolveSchema = z.object({
  resolution: z.enum(["RESOLVED", "REJECTED"]),
  notes: z.string().trim().min(5, "ملاحظات القرار مطلوبة"),
});

export async function POST(request: Request, ctx: RouteContext<"/api/admin/disputes/[disputeId]/resolve">) {
  const guard = await requireAdmin(PERMISSIONS.DISPUTE_RESOLVE);
  if ("error" in guard) return guard.error;

  const { disputeId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    await resolveDispute(disputeId, guard.userId, parsed.data.resolution, parsed.data.notes);
    return apiOk({ ok: true });
  } catch (error) {
    if (error instanceof AdminActionError) return apiError("not_found", error.message, 404);
    throw error;
  }
}
