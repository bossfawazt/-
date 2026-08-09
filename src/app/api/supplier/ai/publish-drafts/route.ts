import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { publishDraftsSchema } from "@/lib/validations/ai";
import { publishAiDrafts } from "@/server/services/ai.service";

/** Creates real DRAFT products from selected AI-suggested drafts (Catalog Scanner / Bulk Import review screens). */
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = publishDraftsSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const products = await publishAiDrafts(session.user.organization.id, parsed.data.drafts);
  return apiOk({ products });
}
