import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { imageStudioSchema } from "@/lib/validations/ai";
import { runImageStudioJob } from "@/server/services/ai.service";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = imageStudioSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const result = await runImageStudioJob(session.user.organization.id, parsed.data.imageUrl, parsed.data.modes);
  return apiOk(result);
}
