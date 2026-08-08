import { auth } from "@/lib/auth";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { productFormSchema } from "@/lib/validations/product";
import { createProduct, listSupplierProducts } from "@/server/services/product.service";

async function requireSupplierSession() {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return null;
  return session;
}

/** docs/UIUX-touq.md #C.5 catalog snapshot / #C.8 supplier product list. */
export async function GET() {
  const session = await requireSupplierSession();
  if (!session) return apiError("forbidden", "متاح للموردين فقط", 403);

  const products = await listSupplierProducts(session.user.organization!.id);
  return apiOk(products);
}

/** docs/UIUX-touq.md #C.8: create a product (always starts as Draft, per the lifecycle in ARCHITECTURE-touq.md #10). */
export async function POST(request: Request) {
  const session = await requireSupplierSession();
  if (!session) return apiError("forbidden", "متاح للموردين فقط", 403);

  const body = await request.json().catch(() => null);
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const product = await createProduct(session.user.organization!.id, parsed.data);
  return apiOk(product, 201);
}
