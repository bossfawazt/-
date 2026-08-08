import type { Metadata } from "next";

export const metadata: Metadata = { title: "سياسة الخصوصية" };

// Placeholder — PDPL-compliant privacy copy (docs/ARCHITECTURE-touq.md #16) is a legal deliverable.
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">سياسة الخصوصية</h1>
      <p className="mt-4 text-muted-foreground">سيتم نشر سياسة الخصوصية المتوافقة مع نظام حماية البيانات الشخصية هنا قبل الإطلاق الرسمي.</p>
    </main>
  );
}
