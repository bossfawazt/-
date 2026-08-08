import { apiOk } from "@/lib/api-response";
import { getFilterableAttributes } from "@/server/services/catalog.service";

/** Filterable abaya attribute definitions + options, for the Marketplace filter panel (docs/UIUX-touq.md #C.2). */
export async function GET() {
  const attributes = await getFilterableAttributes();
  return apiOk(attributes);
}
