import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { marketingKitSchema } from "@/lib/validations/ai";
import { AiServiceError, runMarketingKitJob } from "@/server/services/ai.service";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = marketingKitSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const result = await runMarketingKitJob(session.user.organization.id, parsed.data.productId);
    return apiOk(result);
  } catch (error) {
    if (error instanceof AiServiceError) return apiError("not_found", error.message, 404);
    throw error;
  }
}
