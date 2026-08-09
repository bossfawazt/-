import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/require-admin-session";
import { OrganizationsClient } from "@/features/admin/components/organizations-client";

export const metadata: Metadata = { title: "المستخدمون والمنشآت" };

export default async function AdminOrganizationsPage() {
  await requireAdminSession();
  return <OrganizationsClient />;
}
