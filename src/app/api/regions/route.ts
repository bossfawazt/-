import { db } from "@/lib/db";
import { apiOk } from "@/lib/api-response";

/** Public: powers the region/city select in onboarding (docs/UIUX-touq.md #C.12) and Marketplace filters. */
export async function GET() {
  const regions = await db.region.findMany({
    where: { parentId: { not: null } },
    orderBy: { nameAr: "asc" },
    select: { id: true, nameAr: true, nameEn: true },
  });
  return apiOk(regions);
}
