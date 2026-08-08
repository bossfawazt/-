"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Package, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { SupplierCard } from "@/components/shared/supplier-card";
import { useFavoritesQuery, type FavoritesData } from "@/features/favorites/hooks";
import { useToggleFavoriteMutation } from "@/features/marketplace/hooks";

type SortOption = "recent" | "alpha";

function sortByOption<T extends { favoritedAt: string }>(items: T[], sort: SortOption, nameOf: (item: T) => string) {
  const copy = [...items];
  if (sort === "alpha") copy.sort((a, b) => nameOf(a).localeCompare(nameOf(b), "ar"));
  else copy.sort((a, b) => (a.favoritedAt < b.favoritedAt ? 1 : -1));
  return copy;
}

/** docs/UIUX-touq.md #C.10: merchant's saved suppliers/products, grouped by tab, with undoable unfavorite. */
export function FavoritesClient() {
  const { data, isLoading } = useFavoritesQuery();
  const toggleFavorite = useToggleFavoriteMutation();
  const [sort, setSort] = React.useState<SortOption>("recent");

  async function handleUnfavoriteSupplier(supplier: FavoritesData["suppliers"][number]) {
    await toggleFavorite.mutateAsync({ supplierId: supplier.id });
    toast.success(`تمت إزالة "${supplier.legalNameAr}" من المفضلة`, {
      duration: 5000,
      action: { label: "تراجع", onClick: () => toggleFavorite.mutate({ supplierId: supplier.id }) },
    });
  }

  async function handleUnfavoriteProduct(product: FavoritesData["products"][number]) {
    await toggleFavorite.mutateAsync({ productId: product.id });
    toast.success(`تمت إزالة "${product.titleAr}" من المفضلة`, {
      duration: 5000,
      action: { label: "تراجع", onClick: () => toggleFavorite.mutate({ productId: product.id }) },
    });
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    );
  }

  const suppliers = sortByOption(data?.suppliers ?? [], sort, (s) => s.legalNameAr);
  const products = sortByOption(data?.products ?? [], sort, (p) => p.titleAr);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">المفضلة</h1>
        <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">الأحدث إضافة</SelectItem>
            <SelectItem value="alpha">أبجديًا</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">الموردون ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="products">المنتجات ({products.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="pt-6">
          {!suppliers.length ? (
            <EmptyState
              icon={Store}
              title="لم تقم بحفظ أي موردين بعد"
              description="احفظ الموردين المفضلين لديك للوصول إليهم بسرعة."
              action={
                <Button asChild size="sm">
                  <Link href="/marketplace">تصفح السوق</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="relative">
                  <SupplierCard supplier={supplier} />
                  <Button
                    type="button"
                    variant="icon"
                    size="icon"
                    className="absolute end-3 top-3 size-8 rounded-full bg-card/90 shadow-sm hover:bg-card"
                    onClick={() => handleUnfavoriteSupplier(supplier)}
                    aria-label="إزالة من المفضلة"
                  >
                    <Heart className="size-4 fill-destructive text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="pt-6">
          {!products.length ? (
            <EmptyState
              icon={Package}
              title="لم تقم بحفظ أي منتجات بعد"
              description="احفظ المنتجات المفضلة لديك للوصول إليها بسرعة."
              action={
                <Button asChild size="sm">
                  <Link href="/marketplace">تصفح السوق</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onToggleFavorite={() => handleUnfavoriteProduct(product)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
