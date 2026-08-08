import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/api-response";
import { getSupplierProfile, getSupplierReviews } from "@/server/services/supplier.service";

/** docs/UIUX-touq.md #C.3: public supplier storefront — profile + reviews, enriched with the viewer's follow/review-eligibility state. */
export async function GET(_request: Request, ctx: RouteContext<"/api/suppliers/[supplierId]">) {
  const { supplierId } = await ctx.params;

  const [profile, reviews, session] = await Promise.all([getSupplierProfile(supplierId), getSupplierReviews(supplierId), auth()]);
  if (!profile) return apiError("not_found", "المورد غير موجود", 404);

  let isFollowed = false;
  let reviewableOrderId: string | null = null;

  if (session?.user.organization?.type === "MERCHANT") {
    const merchantId = session.user.organization.id;
    const [favorite, reviewableOrder] = await Promise.all([
      db.favorite.findFirst({ where: { merchantId, supplierId } }),
      db.order.findFirst({
        where: { merchantId, supplierId, status: "COMPLETED", review: null },
        select: { id: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    isFollowed = !!favorite;
    reviewableOrderId = reviewableOrder?.id ?? null;
  }

  return apiOk({ ...profile, reviews, isFollowed, reviewableOrderId });
}
