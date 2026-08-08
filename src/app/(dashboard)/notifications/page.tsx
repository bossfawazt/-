import type { Metadata } from "next";
import { NotificationList } from "@/features/notifications/components/notification-list";

export const metadata: Metadata = { title: "الإشعارات" };

export default function NotificationsPage() {
  return <NotificationList />;
}
