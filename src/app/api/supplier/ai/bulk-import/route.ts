import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { bulkImportSchema } from "@/lib/validations/ai";
import { runBulkImportJob } from "@/server/services/ai.service";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = bulkImportSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const result = await runBulkImportJob(session.user.organization.id, parsed.data.imageUrls);
  return apiOk(result);
}
