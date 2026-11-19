import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CtaBand, Faq, HowItWorks } from "@/features/home/sections";

export const metadata: Metadata = { title: "كيف تعمل المنصة؟" };

const roles = [
  {
    title: "دور المنصة",
    items: ["استقبال طلبك وتصميمك الأولي", "حساب السعر المبدئي من أسعار المصانع", "تنسيق المعاينة وإسناد الطلب لمصنع مناسب", "متابعة الطلب وخدمة العملاء"],
  },
  {
    title: "دور المصنع",
    items: ["القياس النهائي واعتماد المواصفات", "إصدار عرض السعر النهائي", "التصنيع والتوريد والتركيب", "الضمان وفق العقد"],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader eyebrow="طريقة العمل" title="كيف تعمل المنصة؟" description="معمار المنزل منصة وسيطة إلكترونية بين العميل ومصانع المطابخ. لا نمتلك مصنعاً ولا مخزوناً." />
      <HowItWorks withHeading={false} />
      <section className="py-14">
        <div className="container-page grid gap-5 md:grid-cols-2">
          {roles.map((r) => (
            <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">{r.title}</h2>
              <ul className="mt-4 space-y-2.5 text-muted-foreground">
                {r.items.map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="container-page mt-8">
          <p className="rounded-xl bg-accent px-5 py-4 text-sm text-accent-foreground">
            القياسات المدخلة تقديرية، ويجب اعتماد القياس النهائي من الفني قبل التصنيع. والصور المولدة تصورات بصرية أولية
            وليست مخططات تنفيذية.
          </p>
          <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
            <Link href="/design">ابدأ تصميم مطبخك</Link>
          </Button>
        </div>
      </section>
      <Faq />
      <CtaBand />
    </>
  );
}
