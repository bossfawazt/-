import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/require-admin-session";
import { ReportsClient } from "@/features/admin/components/reports-client";

export const metadata: Metadata = { title: "التقارير" };

export default async function AdminReportsPage() {
  await requireAdminSession();
  return <ReportsClient />;
}
