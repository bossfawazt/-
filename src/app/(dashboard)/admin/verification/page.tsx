import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/require-admin-session";
import { VerificationQueueClient } from "@/features/admin/components/verification-queue-client";

export const metadata: Metadata = { title: "طلبات التوثيق" };

export default async function AdminVerificationPage() {
  await requireAdminSession();
  return <VerificationQueueClient />;
}
