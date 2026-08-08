import { auth } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { listOrdersForOrganization } from "@/server/services/order.service";

export async function GET() {
  const session = await auth();
  if (!session?.user.organization) return apiError("forbidden", "يجب تسجيل الدخول كمنشأة", 403);

  const orders = await listOrdersForOrganization(session.user.organization.id, session.user.organization.type);
  return apiOk(orders);
}
