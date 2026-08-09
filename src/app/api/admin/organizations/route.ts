import { requireAdmin } from "@/lib/admin-guard";
import { apiOk } from "@/lib/api-response";
import { getOrganizations } from "@/server/services/admin.service";

export async function GET(request: Request) {
  const guard = await requireAdmin("any");
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const result = await getOrganizations({
    type: type === "SUPPLIER" || type === "MERCHANT" ? type : undefined,
    query: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
  });

  return apiOk(result);
}
