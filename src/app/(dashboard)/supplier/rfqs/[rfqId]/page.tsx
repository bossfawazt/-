import type { Metadata } from "next";
import { RfqDetail } from "@/features/rfq/components/rfq-detail";

export const metadata: Metadata = { title: "تفاصيل طلب الشراء" };

export default async function SupplierRfqDetailPage(props: PageProps<"/supplier/rfqs/[rfqId]">) {
  const { rfqId } = await props.params;
  return <RfqDetail rfqId={rfqId} />;
}
