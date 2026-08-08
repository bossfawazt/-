import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/api-response";
import { getProductById, getRelatedProducts } from "@/server/services/catalog.service";

export async function GET(_request: Request, ctx: RouteContext<"/api/products/[productId]">) {
  const { productId } = await ctx.params;
  const product = await db.product.findUnique({ where: { id: productId }, select: { categoryId: true } });
  if (!product) return apiError("not_found", "المنتج غير موجود", 404);

  const [detail, related, session] = await Promise.all([
    getProductById(productId),
    getRelatedProducts(productId, product.categoryId),
    auth(),
  ]);

  if (!detail) return apiError("not_found", "المنتج غير موجود", 404);

  let isFavorited = false;
  if (session?.user.organization?.type === "MERCHANT") {
    const favorite = await db.favorite.findFirst({
      where: { merchantId: session.user.organization.id, productId },
    });
    isFavorited = !!favorite;
  }

  return apiOk({ ...detail, related, isFavorited });
}
