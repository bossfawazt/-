import { requireAdmin } from "@/lib/admin-guard";
import { apiOk } from "@/lib/api-response";
import { getOverviewStats, getRecentActivity } from "@/server/services/admin.service";

export async function GET() {
  const guard = await requireAdmin("any");
  if ("error" in guard) return guard.error;

  const [stats, activity] = await Promise.all([getOverviewStats(), getRecentActivity(20)]);
  return apiOk({ stats, activity });
}
