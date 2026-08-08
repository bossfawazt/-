import type { Metadata } from "next";
import { ProductForm } from "@/features/catalog/components/product-form";

export const metadata: Metadata = { title: "إضافة منتج" };

export default function NewSupplierProductPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">إضافة منتج جديد</h1>
      <ProductForm />
    </div>
  );
}
