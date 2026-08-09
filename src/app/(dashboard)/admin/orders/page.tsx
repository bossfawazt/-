import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/require-admin-session";
import { DisputesClient } from "@/features/admin/components/disputes-client";

export const metadata: Metadata = { title: "الطلبات والنزاعات" };

export default async function AdminOrdersPage() {
  await requireAdminSession();
  return <DisputesClient />;
}
