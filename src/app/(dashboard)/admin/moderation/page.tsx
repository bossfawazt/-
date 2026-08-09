import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/require-admin-session";
import { ModerationQueueClient } from "@/features/admin/components/moderation-queue-client";

export const metadata: Metadata = { title: "مراجعة المنتجات" };

export default async function AdminModerationPage() {
  await requireAdminSession();
  return <ModerationQueueClient />;
}
