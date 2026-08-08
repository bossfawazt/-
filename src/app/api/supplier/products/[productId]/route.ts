import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { productFormSchema } from "@/lib/validations/product";
import { ProductNotFoundError, getSupplierProductById, updateProduct } from "@/server/services/product.service";

async function requireSupplierSession() {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return null;
  return session;
}

export async function GET(_request: Request, ctx: RouteContext<"/api/supplier/products/[productId]">) {
  const session = await requireSupplierSession();
  if (!session) return apiError("forbidden", "متاح للموردين فقط", 403);

  const { productId } = await ctx.params;
  try {
    const product = await getSupplierProductById(session.user.organization!.id, productId);
    return apiOk(product);
  } catch (error) {
    if (error instanceof ProductNotFoundError) return apiError("not_found", "المنتج غير موجود", 404);
    throw error;
  }
}

export async function PUT(request: Request, ctx: RouteContext<"/api/supplier/products/[productId]">) {
  const session = await requireSupplierSession();
  if (!session) return apiError("forbidden", "متاح للموردين فقط", 403);

  const { productId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const product = await updateProduct(session.user.organization!.id, productId, parsed.data);
    return apiOk(product);
  } catch (error) {
    if (error instanceof ProductNotFoundError) return apiError("not_found", "المنتج غير موجود", 404);
    throw error;
  }
}
