import { requireAdmin } from "@/lib/admin-guard";
import { apiOk } from "@/lib/api-response";
import { getReports } from "@/server/services/admin.service";

export async function GET() {
  const guard = await requireAdmin("any");
  if ("error" in guard) return guard.error;

  const reports = await getReports();
  return apiOk(reports);
}
