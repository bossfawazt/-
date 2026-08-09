"use client";

import Link from "next/link";
import { FileScan, ImagePlus, Images, PlusCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { useAiJobsQuery } from "@/features/ai/hooks";
import { formatRelativeTime } from "@/lib/format";
import { AI_JOB_STATUS_META } from "@/lib/status-labels";

const JOB_TYPE_LABELS: Record<string, string> = {
  PRODUCT_CREATOR: "منشئ المنتجات",
  IMAGE_STUDIO: "استوديو الصور",
  CATALOG_SCANNER: "ماسح الكتالوج",
  BULK_IMPORT: "استيراد جماعي",
  MARKETING_KIT: "حزمة تسويقية",
};

const TOOLS = [
  {
    href: "/supplier/products/new",
    icon: PlusCircle,
    title: "منشئ المنتجات بالذكاء الاصطناعي",
    description: "ارفع صورة المنتج واحصل على اقتراح فوري للعنوان والوصف والمواصفات — قابل للتعديل بالكامل قبل الحفظ.",
  },
  {
    href: "/supplier/ai/image-studio",
    icon: ImagePlus,
    title: "استوديو الصور",
    description: "تحسين الإضاءة، إزالة الخلفية، خلفية فاخرة، وقياس منصات التواصل الاجتماعي.",
  },
  {
    href: "/supplier/ai/catalog",
    icon: FileScan,
    title: "ماسح الكتالوج",
    description: "ارفع PDF أو صور أو ملف مضغوط لكتالوجك الحالي، وسيقوم النظام باستخراج مسودات منتجات جاهزة للمراجعة.",
  },
  {
    href: "/supplier/ai/bulk-import",
    icon: Images,
    title: "الاستيراد الجماعي",
    description: "ارفع عدة صور منتجات دفعة واحدة، وراجع المسودات المقترحة قبل نشرها.",
  },
];

/** docs (new): AI Supplier Tools hub — every tool here is backed by a Mock AI provider today (docs/AI-SYSTEM-touq.md), clearly labeled, with an architecture ready to swap in a real model API. */
export function AiHubClient() {
  const { data: jobs, isLoading } = useAiJobsQuery();

  return (
    <div className="p-6">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">أدوات الذكاء الاصطناعي</h1>
        <Badge variant="gold">Mock AI</Badge>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        هذه الأدوات تعمل حاليًا عبر مزوّد ذكاء اصطناعي تجريبي (Mock) يبني اقتراحات واقعية من بيانات المنصة الفعلية، وليس
        نموذج ذكاء اصطناعي حقيقي بعد. جميع الاقتراحات قابلة للتعديل الكامل قبل الحفظ، والبنية جاهزة لاستبدال المزوّد
        بنموذج حقيقي لاحقًا دون تغيير الواجهات.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <tool.icon className="size-5" />
                </span>
                <h2 className="font-semibold text-foreground">{tool.title}</h2>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>سجل العمليات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !jobs?.length ? (
            <EmptyState icon={Sparkles} title="لم تُستخدم أي أداة بعد" description="ستظهر هنا كل عملية تشغّلها من أدوات الذكاء الاصطناعي." />
          ) : (
            <div className="flex flex-col gap-2">
              {jobs.map((job) => {
                const meta = AI_JOB_STATUS_META[job.status];
                return (
                  <div key={job.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                    <span className="text-foreground">{JOB_TYPE_LABELS[job.type] ?? job.type}</span>
                    <div className="flex items-center gap-3">
                      {job.resultCount > 0 ? <span className="text-xs text-muted-foreground">{job.resultCount} نتيجة</span> : null}
                      <StatusPill labelAr={meta.labelAr} variant={meta.variant} />
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(job.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
