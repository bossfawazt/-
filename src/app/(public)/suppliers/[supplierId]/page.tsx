import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupplierProfile } from "@/server/services/supplier.service";
import { SupplierProfileClient } from "@/features/suppliers/components/supplier-profile-client";

export async function generateMetadata(props: PageProps<"/suppliers/[supplierId]">): Promise<Metadata> {
  const { supplierId } = await props.params;
  const profile = await getSupplierProfile(supplierId);
  return { title: profile?.legalNameAr ?? "المورد" };
}

/** docs/UIUX-touq.md #C.3: public supplier storefront. */
export default async function SupplierProfilePage(props: PageProps<"/suppliers/[supplierId]">) {
  const { supplierId } = await props.params;

  const profile = await getSupplierProfile(supplierId);
  if (!profile) notFound();

  return <SupplierProfileClient supplierId={supplierId} />;
}
