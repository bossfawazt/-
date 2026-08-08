import type { Metadata } from "next";
import { OrderList } from "@/features/orders/components/order-list";

export const metadata: Metadata = { title: "الطلبات" };

export default function MerchantOrdersPage() {
  return <OrderList />;
}
