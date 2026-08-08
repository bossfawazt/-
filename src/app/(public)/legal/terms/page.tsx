import type { Metadata } from "next";

export const metadata: Metadata = { title: "الشروط والأحكام" };

// Placeholder — legal copy is a business/legal deliverable, not an engineering one.
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">الشروط والأحكام</h1>
      <p className="mt-4 text-muted-foreground">سيتم نشر الشروط والأحكام الكاملة هنا قبل الإطلاق الرسمي.</p>
    </main>
  );
}
