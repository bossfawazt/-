import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketplaceClient } from "@/features/marketplace/components/marketplace-client";

export const metadata: Metadata = { title: "السوق" };

/** docs/UIUX-touq.md #C.2: Marketplace browse/search/filter grid. */
export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceClient />
    </Suspense>
  );
}
