import type { Metadata } from "next";
import { SupplierDirectoryClient } from "@/features/suppliers/components/supplier-directory-client";

export const metadata: Metadata = { title: "الموردون" };

export default function SuppliersPage() {
  return <SupplierDirectoryClient />;
}
