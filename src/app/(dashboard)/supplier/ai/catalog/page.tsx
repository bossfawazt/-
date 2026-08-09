import type { Metadata } from "next";
import { CatalogScannerClient } from "@/features/ai/components/catalog-scanner-client";

export const metadata: Metadata = { title: "ماسح الكتالوج" };

export default function CatalogScannerPage() {
  return <CatalogScannerClient />;
}
