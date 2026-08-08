import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProductById, getRelatedProducts } from "@/server/services/catalog.service";
import { ProductDetailsClient } from "@/features/marketplace/components/product-details-client";

export async function generateMetadata(props: PageProps<"/marketplace/[productId]">): Promise<Metadata> {
  const { productId } = await props.params;
  const product = await getProductById(productId);
  return { title: product?.titleAr ?? "المنتج" };
}

/** docs/UIUX-touq.md #C.7: Product Details — gallery, variants, pricing tiers, RFQ CTA. */
export default async function ProductDetailsPage(props: PageProps<"/marketplace/[productId]">) {
  const { productId } = await props.params;

  const productRecord = await db.product.findUnique({ where: { id: productId }, select: { categoryId: true } });
  if (!productRecord) notFound();

  const [product, related, session] = await Promise.all([
    getProductById(productId),
    getRelatedProducts(productId, productRecord.categoryId),
    auth(),
  ]);

  if (!product) notFound();

  let isFavorited = false;
  if (session?.user.organization?.type === "MERCHANT") {
    const favorite = await db.favorite.findFirst({
      where: { merchantId: session.user.organization.id, productId },
    });
    isFavorited = !!favorite;
  }

  return (
    <ProductDetailsClient
      product={product}
      related={related}
      initialIsFavorited={isFavorited}
      viewerRole={session?.user.organization?.type ?? (session?.user.platformRole ? "ADMIN" : null)}
    />
  );
}
