import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProductNotFoundError, getSupplierProductById } from "@/server/services/product.service";
import { ProductForm } from "@/features/catalog/components/product-form";
import { MarketingKitPanel } from "@/features/ai/components/marketing-kit-panel";
import type { ProductFormInput } from "@/lib/validations/product";

export const metadata: Metadata = { title: "تعديل المنتج" };

export default async function EditSupplierProductPage(props: PageProps<"/supplier/products/[productId]/edit">) {
  const { productId } = await props.params;
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") redirect("/login");

  let product;
  try {
    product = await getSupplierProductById(session.user.organization.id, productId);
  } catch (error) {
    if (error instanceof ProductNotFoundError) notFound();
    throw error;
  }

  const defaultValues: Partial<ProductFormInput> = {
    titleAr: product.titleAr,
    titleEn: product.titleEn ?? "",
    descriptionAr: product.descriptionAr ?? "",
    attributes: Object.fromEntries(
      product.attributeValues
        .filter((av) => av.attributeOption)
        .map((av) => [av.attributeDefinition.key, av.attributeOption!.key]),
    ) as ProductFormInput["attributes"],
    media: product.media.map((m) => ({ url: m.url, isPrimary: m.isPrimary })),
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color ?? "",
      size: v.size ?? "",
      moq: v.moq,
      leadTimeDays: v.leadTimeDays,
      stockStatus: v.stockStatus,
      pricingTiers: v.pricingTiers.map((t) => ({
        minQty: t.minQty,
        maxQty: t.maxQty,
        unitPriceSar: t.unitPriceMinor / 100,
      })),
    })),
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">تعديل المنتج</h1>
      <div className="mb-6">
        <MarketingKitPanel productId={productId} />
      </div>
      <ProductForm productId={productId} defaultValues={defaultValues} />
    </div>
  );
}
