import { SupplierCard } from "@/components/shared/supplier-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getFeaturedSuppliers } from "@/server/services/catalog.service";
import { Building2 } from "lucide-react";

/** docs/UIUX-touq.md #C.1 section 5: featured/verified suppliers, real data (top-rated verified). */
export async function FeaturedSuppliers() {
  const suppliers = await getFeaturedSuppliers(4);

  if (!suppliers.length) {
    return (
      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState icon={Building2} title="الموردون الموثقون قادمون قريبًا" />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">موردون موثقون</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {suppliers.map((supplier) => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>
    </section>
  );
}
