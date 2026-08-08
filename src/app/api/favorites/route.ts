import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { getFavorites } from "@/server/services/favorites.service";

const toggleSchema = z
  .object({ supplierId: z.string().uuid().optional(), productId: z.string().uuid().optional() })
  .refine((data) => !!data.supplierId !== !!data.productId, {
    error: "حدد مورد أو منتج واحد فقط",
  });

/** docs/UIUX-touq.md #C.10: merchant's saved suppliers/products. */
export async function GET() {
  const session = await auth();
  if (session?.user.organization?.type !== "MERCHANT") return apiError("forbidden", "متاح للتجار فقط", 403);

  const favorites = await getFavorites(session.user.organization.id);
  return apiOk(favorites);
}

/** Toggles a favorite on/off — one POST handles both add and remove. */
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.organization?.type !== "MERCHANT") return apiError("forbidden", "متاح للتجار فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const merchantId = session.user.organization.id;
  const { supplierId, productId } = parsed.data;

  const existing = await db.favorite.findFirst({
    where: { merchantId, ...(supplierId ? { supplierId } : { productId }) },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    return apiOk({ favorited: false });
  }

  await db.favorite.create({ data: { merchantId, supplierId, productId } });
  return apiOk({ favorited: true });
}
