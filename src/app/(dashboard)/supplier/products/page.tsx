import type { Metadata } from "next";
import { ProductList } from "@/features/catalog/components/product-list";

export const metadata: Metadata = { title: "منتجاتي" };

export default function SupplierProductsPage() {
  return <ProductList />;
}
