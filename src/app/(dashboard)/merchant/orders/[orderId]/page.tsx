import type { Metadata } from "next";
import { OrderDetail } from "@/features/orders/components/order-detail";

export const metadata: Metadata = { title: "تفاصيل الطلب" };

export default async function MerchantOrderDetailPage(props: PageProps<"/merchant/orders/[orderId]">) {
  const { orderId } = await props.params;
  return <OrderDetail orderId={orderId} />;
}
