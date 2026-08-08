import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProducts } from "@/server/services/catalog.service";
import { apiOk } from "@/lib/api-response";

const ATTRIBUTE_KEYS = ["style", "fabric", "color", "embroidery", "season", "category"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const attributes: Record<string, string[]> = {};
  for (const key of ATTRIBUTE_KEYS) {
    const value = searchParams.get(key);
    if (value) attributes[key] = value.split(",").filter(Boolean);
  }

  const session = await auth();
  let favoritedProductIds: Set<string> | undefined;
  if (session?.user.organization?.type === "MERCHANT") {
    const favorites = await db.favorite.findMany({
      where: { merchantId: session.user.organization.id, productId: { not: null } },
      select: { productId: true },
    });
    favoritedProductIds = new Set(favorites.map((f) => f.productId!));
  }

  const result = await getProducts({
    favoritedProductIds,
    query: searchParams.get("q") ?? undefined,
    attributes,
    priceMinMinor: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) * 100 : undefined,
    priceMaxMinor: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) * 100 : undefined,
    moqMax: searchParams.get("moqMax") ? Number(searchParams.get("moqMax")) : undefined,
    regionId: searchParams.get("region") ?? undefined,
    supplierId: searchParams.get("supplierId") ?? undefined,
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
    verifiedOnly: searchParams.get("verifiedOnly") === "true",
    inStockOnly: searchParams.get("inStockOnly") === "true",
    sort: (searchParams.get("sort") as "relevance" | "newest" | "price_asc" | "price_desc" | "rating") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
  });

  return apiOk(result);
}
