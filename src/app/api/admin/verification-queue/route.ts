import { requireAdmin } from "@/lib/admin-guard";
import { apiOk } from "@/lib/api-response";
import { getVerificationQueue } from "@/server/services/admin.service";

export async function GET() {
  const guard = await requireAdmin("any");
  if ("error" in guard) return guard.error;

  const queue = await getVerificationQueue();
  return apiOk(queue);
}
