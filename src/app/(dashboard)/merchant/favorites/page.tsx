import type { Metadata } from "next";
import { FavoritesClient } from "@/features/favorites/components/favorites-client";

export const metadata: Metadata = { title: "المفضلة" };

export default function MerchantFavoritesPage() {
  return <FavoritesClient />;
}
