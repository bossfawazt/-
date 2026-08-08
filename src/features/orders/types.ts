import type { OrderStatus } from "@/generated/prisma/client";

export interface OrderItemData {
  id: string;
  qty: number;
  unitPriceMinor: number;
  subtotalMinor: number;
  variant: {
    color: string | null;
    size: string | null;
    product: { titleAr: string };
  };
}

export interface OrderReviewData {
  rating: number;
  comment: string | null;
}

export interface OrderDetailData {
  id: string;
  status: OrderStatus;
  totalAmountMinor: number;
  currency: string;
  createdAt: string;
  merchant: { legalNameAr: string };
  supplier: { legalNameAr: string };
  items: OrderItemData[];
  review: OrderReviewData | null;
}
