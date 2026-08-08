"use client";

import * as React from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { SupplierCard } from "@/components/shared/supplier-card";
import { useRegionsQuery } from "@/features/auth/hooks";
import { useInfiniteSuppliersQuery, type SupplierDirectoryFilters } from "@/features/suppliers/hooks";

/** docs/UIUX-touq.md #C.8: Suppliers directory — the standalone /suppliers route. */
export function SupplierDirectoryClient() {
  const [filters, setFilters] = React.useState<SupplierDirectoryFilters>({ sort: "rating" });
  const [searchInput, setSearchInput] = React.useState("");
  const { data: regions } = useRegionsQuery();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteSuppliersQuery(filters);
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, q: searchInput }));
  }

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">الموردون</h1>
        <p className="text-sm text-muted-foreground">تصفّح مصانع ومحلات العبايات الموثّقة على منصة توق.</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="ابحث عن مورد بالاسم..."
          className="h-12 text-base"
        />
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Switch
            id="suppliers-verified-only"
            checked={!!filters.verifiedOnly}
            onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, verifiedOnly: checked }))}
          />
          <Label htmlFor="suppliers-verified-only" className="text-sm font-normal">
            موردون موثقون فقط
          </Label>
        </div>

        <Select
          value={filters.region ?? "all"}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, region: value === "all" ? undefined : value }))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="كل المناطق" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المناطق</SelectItem>
            {regions?.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort ?? "rating"} onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value as SupplierDirectoryFilters["sort"] }))}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">الأعلى تقييمًا</SelectItem>
            <SelectItem value="newest">الأحدث انضمامًا</SelectItem>
            <SelectItem value="name">أبجديًا</SelectItem>
          </SelectContent>
        </Select>

        <span className="ms-auto text-sm text-muted-foreground">{isLoading ? "جارٍ التحميل..." : `${total} مورد`}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState icon={Store} title="لا يوجد موردون يطابقون البحث" description="جرّب تعديل الفلاتر أو البحث بكلمات مختلفة." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>

          {hasNextPage ? (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
                عرض المزيد
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
