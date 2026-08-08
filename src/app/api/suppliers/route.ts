import { getSuppliers } from "@/server/services/supplier.service";
import { apiOk } from "@/lib/api-response";

/** docs/UIUX-touq.md #C.8: Suppliers directory/search results tab. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const result = await getSuppliers({
    query: searchParams.get("q") ?? undefined,
    regionId: searchParams.get("region") ?? undefined,
    verifiedOnly: searchParams.get("verifiedOnly") === "true",
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
    sort: (searchParams.get("sort") as "rating" | "newest" | "name") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
  });

  return apiOk(result);
}
