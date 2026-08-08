import type { Metadata } from "next";
import { SettingsClient } from "@/features/settings/components/settings-client";

export const metadata: Metadata = { title: "الإعدادات" };

export default function SettingsPage() {
  return <SettingsClient />;
}
