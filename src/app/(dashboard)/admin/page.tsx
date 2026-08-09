import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/require-admin-session";
import { OverviewClient } from "@/features/admin/components/overview-client";

export const metadata: Metadata = { title: "لوحة الإدارة" };

export default async function AdminDashboardPage() {
  await requireAdminSession();
  return <OverviewClient />;
}
