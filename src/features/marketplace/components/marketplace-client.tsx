"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { FilterPanel } from "@/features/marketplace/components/filter-panel";
import { SortSelect } from "@/features/marketplace/components/sort-select";
import { useInfiniteProductsQuery, useToggleFavoriteMutation, type MarketplaceFilters } from "@/features/marketplace/hooks";

const ARRAY_KEYS = ["style", "fabric", "color", "embroidery", "season", "category"] as const;

function parseFiltersFromSearchParams(params: URLSearchParams): Omit<MarketplaceFilters, "page"> {
  const filters: Omit<MarketplaceFilters, "page"> = {
    q: params.get("q") ?? undefined,
    priceMin: params.get("priceMin") ? Number(params.get("priceMin")) : undefined,
    priceMax: params.get("priceMax") ? Number(params.get("priceMax")) : undefined,
    verifiedOnly: params.get("verifiedOnly") === "true",
    sort: params.get("sort") ?? "relevance",
  };
  for (const key of ARRAY_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = value.split(",").filter(Boolean);
  }
  return filters;
}

export function MarketplaceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = React.useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = React.useState(filters.q ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProductsQuery(filters);
  const toggleFavorite = useToggleFavoriteMutation();

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  function applyFilters(next: Omit<MarketplaceFilters, "page">) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "" || value === false) continue;
      if (Array.isArray(value)) {
        if (value.length) params.set(key, value.join(","));
        continue;
      }
      params.set(key, String(value));
    }
    router.push(`/marketplace?${params.toString()}`, { scroll: false });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ ...filters, q: searchInput });
  }

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const key of ARRAY_KEYS) {
    for (const optionKey of filters[key] ?? []) {
      activeChips.push({
        key: `${key}:${optionKey}`,
        label: optionKey,
        onRemove: () => applyFilters({ ...filters, [key]: (filters[key] ?? []).filter((v) => v !== optionKey) }),
      });
    }
  }
  if (filters.verifiedOnly) {
    activeChips.push({ key: "verified", label: "موردون موثقون", onRemove: () => applyFilters({ ...filters, verifiedOnly: false }) });
  }

  const filterPanelProps = {
    filters,
    onChange: (next: Omit<MarketplaceFilters, "page">) => applyFilters(next),
    onClear: () => applyFilters({ sort: filters.sort }),
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="ابحث عن عباية، قماش، أو مورد..."
          className="h-12 text-base"
        />
      </form>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterPanel {...filterPanelProps} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{isLoading ? "جارٍ التحميل..." : `${total} نتيجة`}</span>
            <div className="flex items-center gap-2">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="secondary" size="sm">
                    <SlidersHorizontal className="size-4" /> الفلاتر
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>الفلاتر</SheetTitle>
                  </SheetHeader>
                  <FilterPanel {...filterPanelProps} />
                  <Button className="mt-4 w-full" onClick={() => setMobileFiltersOpen(false)}>
                    عرض النتائج
                  </Button>
                </SheetContent>
              </Sheet>
              <SortSelect value={filters.sort ?? "relevance"} onChange={(sort) => applyFilters({ ...filters, sort })} />
            </div>
          </div>

          {activeChips.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
                >
                  {chip.label}
                  <X className="size-3" />
                </button>
              ))}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full" />
              ))}
            </div>
          ) : !items.length ? (
            <EmptyState
              icon={PackageSearch}
              title="لا توجد منتجات تطابق الفلاتر المحددة"
              action={
                <Button variant="secondary" onClick={filterPanelProps.onClear}>
                  مسح الفلاتر
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onToggleFavorite={(productId) => toggleFavorite.mutate({ productId })}
                  />
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
      </div>
    </div>
  );
}
