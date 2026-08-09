import type { Metadata } from "next";
import { BulkImportClient } from "@/features/ai/components/bulk-import-client";

export const metadata: Metadata = { title: "الاستيراد الجماعي" };

export default function BulkImportPage() {
  return <BulkImportClient />;
}
