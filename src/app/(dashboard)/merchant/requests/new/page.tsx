import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProductById } from "@/server/services/catalog.service";
import { RfqBuilderForm } from "@/features/rfq/components/rfq-builder-form";

export const metadata: Metadata = { title: "طلب شراء جديد" };

export default async function NewRfqPage(props: PageProps<"/merchant/requests/new">) {
  const searchParams = await props.searchParams;
  const productId = typeof searchParams.productId === "string" ? searchParams.productId : undefined;
  const variantId = typeof searchParams.variantId === "string" ? searchParams.variantId : undefined;
  const qty = typeof searchParams.qty === "string" ? Number(searchParams.qty) : undefined;
  const supplierIdParam = typeof searchParams.supplierId === "string" ? searchParams.supplierId : undefined;

  let supplierId = supplierIdParam;
  let supplierName = "";
  let productTitle: string | undefined;
  let variantLabel: string | undefined;
  let minQty = qty ?? 1;

  if (productId) {
    const product = await getProductById(productId);
    if (!product) redirect("/marketplace");
    supplierId = product.supplier.id;
    supplierName = product.supplier.legalNameAr;
    productTitle = product.titleAr;
    const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
    variantLabel = variant ? [variant.color, variant.size].filter(Boolean).join(" / ") : undefined;
    minQty = qty ?? variant?.moq ?? 1;
  }

  if (!supplierId) redirect("/marketplace");

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">طلب شراء جديد</h1>
      <RfqBuilderForm
        supplierId={supplierId}
        supplierName={supplierName}
        productId={productId}
        productTitle={productTitle}
        variantId={variantId}
        variantLabel={variantLabel}
        minQty={minQty}
      />
    </div>
  );
}
