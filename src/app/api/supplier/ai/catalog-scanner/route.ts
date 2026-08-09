import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { catalogScannerSchema } from "@/lib/validations/ai";
import { runCatalogScannerJob } from "@/server/services/ai.service";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = catalogScannerSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const result = await runCatalogScannerJob(session.user.organization.id, parsed.data.fileUrl, parsed.data.fileName);
  return apiOk(result);
}
