import type { Metadata } from "next";
import { RfqDetail } from "@/features/rfq/components/rfq-detail";

export const metadata: Metadata = { title: "تفاصيل طلب الشراء" };

export default async function MerchantRfqDetailPage(props: PageProps<"/merchant/requests/[rfqId]">) {
  const { rfqId } = await props.params;
  return <RfqDetail rfqId={rfqId} />;
}
