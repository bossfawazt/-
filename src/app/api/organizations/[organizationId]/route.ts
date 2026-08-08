import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { PERMISSIONS, canActOnOrganization } from "@/lib/session";
import { businessDetailsSchema } from "@/lib/validations/auth";

export async function GET(_request: Request, ctx: RouteContext<"/api/organizations/[organizationId]">) {
  const { organizationId } = await ctx.params;
  const organization = await db.organization.findUnique({ where: { id: organizationId } });
  if (!organization) return apiError("not_found", "المنشأة غير موجودة", 404);
  return apiOk(organization);
}

/** Business Details step of onboarding (docs/UIUX-touq.md #C.12), and later Settings > Organization (#C.13). */
export async function PATCH(request: Request, ctx: RouteContext<"/api/organizations/[organizationId]">) {
  const { organizationId } = await ctx.params;
  const session = await auth();

  if (!session?.user || !canActOnOrganization(
    { platformRole: session.user.platformRole, organization: session.user.organization },
    organizationId,
    PERMISSIONS.ORG_MANAGE_PROFILE,
  )) {
    return apiError("forbidden", "غير مصرح لك بتعديل بيانات هذه المنشأة", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = businessDetailsSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const organization = await db.organization.update({
    where: { id: organizationId },
    data: {
      legalNameAr: parsed.data.legalNameAr,
      legalNameEn: parsed.data.legalNameEn || null,
      crNumber: parsed.data.crNumber,
      maroofId: parsed.data.maroofId || null,
      regionId: parsed.data.regionId,
      city: parsed.data.city,
      descriptionAr: parsed.data.descriptionAr || null,
    },
  });

  return apiOk(organization);
}
