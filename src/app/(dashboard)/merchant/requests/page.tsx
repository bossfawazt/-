import type { Metadata } from "next";
import { RfqList } from "@/features/rfq/components/rfq-list";

export const metadata: Metadata = { title: "طلبات الشراء" };

export default function MerchantRequestsPage() {
  return <RfqList />;
}
