import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  CalendarCheck,
  Camera,
  ClipboardCheck,
  Factory,
  MessagesSquare,
  Palette,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { KitchenIllustration } from "@/components/illustrations/kitchen-illustration";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { galleryConcepts } from "@/features/gallery/designs";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-base text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid items-center gap-10 pb-14 pt-8 md:pt-14 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:pb-20">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            متاح الآن في {siteConfig.launchCity}
          </p>
          <h1 className="mt-5 text-[2.125rem] font-bold leading-[1.25] text-foreground sm:text-5xl sm:leading-[1.2]">
            مطبخ أحلامك يبدأ من هنا
          </h1>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
            صمم مطبخك بالذكاء الاصطناعي، اختر التفاصيل، واحصل على عرض سعر من مصانع موثوقة.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/design">
                ابدأ تصميم مطبخك
                <ArrowLeft aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full border-border bg-card sm:w-auto">
              <Link href="/how-it-works">كيف تعمل المنصة؟</Link>
            </Button>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            {["تصميم أولي مجاني", "سعر مبدئي من بيانات المصانع", "معاينة وقياس من فني"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative">
          <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_30px_60px_-30px_rgba(47,74,62,0.35)]">
            <KitchenIllustration
              style="luxury"
              cabinetColor="#3F5A4A"
              upperColor="#EFE8DC"
              countertop="marble"
              wallColor="#EEE7DB"
              title="رسم توضيحي لمطبخ فاخر بخزائن خضراء وسطح رخامي"
            />
          </div>
          <figcaption className="absolute -bottom-5 start-4 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur sm:start-8">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--green-tint)] text-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <span className="text-sm leading-snug">
              <span className="block font-semibold text-foreground">تصوّر قبل التنفيذ</span>
              <span className="text-muted-foreground">رسم توضيحي للأنماط المتاحة</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Camera,
    title: "صوّر مطبخك",
    text: "ارفع من 3 إلى 5 صور للمساحة الحالية وأدخل المقاسات التقريبية.",
  },
  {
    icon: Palette,
    title: "اختر التفاصيل",
    text: "النمط والألوان والخامات والأسطح والأجهزة والإضافات.",
  },
  {
    icon: Sparkles,
    title: "شاهد التصور",
    text: "تصور بصري بالذكاء الاصطناعي وسعر مبدئي محسوب من أسعار المصانع.",
  },
  {
    icon: CalendarCheck,
    title: "معاينة وعرض نهائي",
    text: "فني يقيس في موقعك، ثم يصلك عرض السعر النهائي من المصنع.",
  },
];

export function HowItWorks({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section id="how" className="bg-card py-16 sm:py-20">
      <div className="container-page">
        {withHeading ? (
          <SectionHeading eyebrow="طريقة العمل" title="أربع خطوات من الفكرة إلى التركيب" description="تجربة متدرجة واضحة، ويمكنك حفظ مشروعك وإكماله لاحقاً." />
        ) : null}
        <ol className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", withHeading && "mt-12")}>
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-border bg-background p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-xl bg-[var(--green-tint)] text-primary">
                  <step.icon className="size-6" aria-hidden />
                </span>
                <span className="text-3xl font-bold text-[var(--sand)]" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                <span className="sr-only">الخطوة {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function GalleryPreview() {
  const items = galleryConcepts.slice(0, 3);
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading align="start" eyebrow="معرض التصاميم" title="أنماط تناسب كل منزل" description="رسومات توضيحية للأنماط المتاحة. صمم نسختك الخاصة بصور مطبخك." />
          <Button asChild variant="tertiary" className="self-start px-0 sm:self-auto">
            <Link href="/gallery">
              عرض كل الأنماط
              <ArrowLeft aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((d) => (
            <GalleryCard key={d.key} concept={d} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryCard({ concept: d }: { concept: (typeof galleryConcepts)[number] }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(31,36,32,0.35)]">
      <div className="overflow-hidden border-b border-border">
        <KitchenIllustration
          style={d.style}
          cabinetColor={d.cabinetColor}
          upperColor={d.upperColor}
          countertop={d.countertop}
          wallColor={d.wallColor}
          withIsland={d.withIsland}
          title={`رسم توضيحي: ${d.title}`}
          className="transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-5">
        <p className="eyebrow">{d.styleLabel}</p>
        <h3 className="mt-1 text-lg font-semibold">{d.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {d.tags.map((t) => (
            <li key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

const features = [
  { icon: Sparkles, title: "تصور بالذكاء الاصطناعي", text: "يحافظ قدر الإمكان على شكل غرفتك ونوافذها وأبوابها، ويمكنك التعديل وإعادة التوليد." },
  { icon: Calculator, title: "سعر مبدئي شفاف", text: "نطاق سعري محسوب من قاعدة أسعار المصانع الفعلية، وليس تقديراً عشوائياً." },
  { icon: Ruler, title: "قياس من فني", text: "القياسات التي تدخلها تقديرية، ويعتمد الفني القياس النهائي قبل التصنيع." },
  { icon: Factory, title: "مصانع معتمدة", text: "نتعامل مع مصانع في الرياض بعقود واضحة للتصنيع والتركيب والضمان." },
  { icon: ClipboardCheck, title: "متابعة حتى التسليم", text: "حالة طلبك واضحة في كل مرحلة: المعاينة، العرض، التصنيع، والتركيب." },
  { icon: MessagesSquare, title: "خدمة عملاء", text: "استفسارات وشكاوى مسجلة ومتابعة حتى الحل." },
];

export function Features() {
  return (
    <section className="bg-[var(--ivory-deep)] py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading eyebrow="لماذا معمار المنزل" title="قرار واثق قبل أي تنفيذ" />
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary">
                <f.icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnersSection({ partners }: { partners: { id: string; trade_name: string; city: string }[] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading eyebrow="المصانع الشريكة" title="نصنع مطبخك مع مصانع محلية موثوقة" description="المصنع مسؤول عن القياس النهائي والتصنيع والتوريد والتركيب والضمان وفق العقد." />
        {partners.length > 0 ? (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((p) => (
              <li key={p.id} className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 py-6 text-center">
                <Factory className="size-6 text-walnut" aria-hidden />
                <span className="mt-3 font-semibold">{p.trade_name}</span>
                <span className="text-xs text-muted-foreground">{p.city}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--input)] bg-card px-6 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-walnut">
              <Truck className="size-6" aria-hidden />
            </span>
            <p className="text-base font-semibold">نعمل حالياً على اعتماد أول المصانع الشريكة في الرياض</p>
            <p className="max-w-md text-sm text-muted-foreground">
              تظهر هنا أسماء المصانع بعد توقيع اتفاقيات الشراكة رسمياً. هل تملك مصنع مطابخ؟
            </p>
            <Button asChild variant="secondary" className="border-border">
              <Link href="/contact?topic=partnership">انضم كمصنع شريك</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export const faqs = [
  {
    q: "هل الصورة المولدة مخطط تنفيذي للمطبخ؟",
    a: "لا. الصور تصورات بصرية أولية تساعدك على اتخاذ القرار، وليست مخططات تنفيذية ولا تضمن تطابق الأبعاد. التصميم التنفيذي يعتمد على قياس الفني.",
  },
  {
    q: "كيف يُحسب السعر المبدئي؟",
    a: "من قاعدة أسعار فعلية يدخلها المصنع للخامات والوحدات والتركيب، بناءً على مقاساتك واختياراتك. السعر النهائي يصدر بعد المعاينة والقياس واعتماد المواصفات. إذا لم تتوفر أسعار كافية لن نعرض رقماً.",
  },
  {
    q: "هل القياسات التي أدخلها نهائية؟",
    a: "لا. القياسات المدخلة تقديرية، ويجب اعتماد القياس النهائي من الفني قبل التصنيع.",
  },
  {
    q: "من المسؤول عن التصنيع والضمان؟",
    a: "المصنع الشريك مسؤول عن القياس النهائي والتصنيع والتوريد والتركيب والضمان وفق العقد. المنصة تستقبل الطلب وتنسق وتتابع معك حتى التسليم.",
  },
  {
    q: "هل تُستخدم صوري لأغراض أخرى؟",
    a: "لا تُستخدم صورك إلا لتقديم الخدمة. لا نستخدمها في تدريب النماذج أو التسويق إلا بموافقة مستقلة وصريحة منك. التفاصيل في سياسة الخصوصية.",
  },
  {
    q: "في أي المدن تتوفر الخدمة؟",
    a: "نبدأ في الرياض، وللمطابخ فقط في هذه المرحلة.",
  },
];

export function Faq() {
  return (
    <section className="bg-card py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading align="start" eyebrow="الأسئلة الشائعة" title="إجابات واضحة قبل أن تبدأ" description="لم تجد إجابتك؟ تواصل معنا وسنرد عليك." />
        <div className="divide-y divide-border rounded-2xl border border-border bg-background">
          {faqs.map((item) => (
            <details key={item.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                {item.q}
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="pb-5 text-sm leading-7 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{siteConfig.tagline}</h2>
            <p className="mt-3 text-primary-foreground/80">ابدأ مشروعك الآن واحفظه لتكمله في أي وقت.</p>
            <Button asChild size="lg" className="mt-7 w-full bg-[var(--ivory)] text-primary hover:bg-white sm:w-auto">
              <Link href="/design">
                ابدأ تصميم مطبخك
                <ArrowLeft aria-hidden />
              </Link>
            </Button>
          </div>
          <svg className="absolute -bottom-10 end-[-2rem] h-64 w-64 opacity-15 sm:h-80 sm:w-80" viewBox="0 0 40 40" aria-hidden>
            <path d="M11 31V18.5C11 13.25 15.03 9 20 9s9 4.25 9 9.5V31" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M15 22.5h10M15 26.75h10M8 31h24" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
    </section>
  );
}
