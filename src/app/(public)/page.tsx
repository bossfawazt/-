import { CategoryTiles } from "@/features/landing/components/category-tiles";
import { CtaBanner } from "@/features/landing/components/cta-banner";
import { FeaturedSuppliers } from "@/features/landing/components/featured-suppliers";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Testimonials } from "@/features/landing/components/testimonials";
import { ValueProps } from "@/features/landing/components/value-props";
import { getPlatformStats } from "@/server/services/catalog.service";

// Statically prerendered at build time (no per-request dynamic APIs used);
// revalidate periodically so the stats/featured-suppliers band doesn't go
// stale between deploys (docs/ARCHITECTURE-touq.md #15 cache-aside pattern).
export const revalidate = 300;

/** docs/UIUX-touq.md #C.1: full public landing page. */
export default async function HomePage() {
  const stats = await getPlatformStats();

  return (
    <>
      <Hero supplierCount={stats.supplierCount} productCount={stats.productCount} cityCount={stats.cityCount} />
      <ValueProps />
      <CategoryTiles />
      <FeaturedSuppliers />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
