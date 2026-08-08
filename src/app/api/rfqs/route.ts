import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { createRfqSchema } from "@/lib/validations/rfq";
import { createRfq, listRfqsForOrganization } from "@/server/services/rfq.service";

export async function GET() {
  const session = await auth();
  if (!session?.user.organization) return apiError("forbidden", "يجب تسجيل الدخول كمنشأة", 403);

  const rfqs = await listRfqsForOrganization(session.user.organization.id, session.user.organization.type);
  return apiOk(rfqs);
}

/** docs/UIUX-touq.md #C.9: merchant sends a purchase request. */
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.organization?.type !== "MERCHANT") return apiError("forbidden", "متاح للتجار فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = createRfqSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const rfq = await createRfq(session.user.organization.id, session.user.id, parsed.data);
  return apiOk(rfq, 201);
}
