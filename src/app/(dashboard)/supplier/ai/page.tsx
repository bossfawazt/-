import type { Metadata } from "next";
import { AiHubClient } from "@/features/ai/components/ai-hub-client";

export const metadata: Metadata = { title: "أدوات الذكاء الاصطناعي" };

export default function SupplierAiHubPage() {
  return <AiHubClient />;
}
