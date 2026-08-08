import { Quote } from "lucide-react";

/** docs/UIUX-touq.md #C.1 section 7: social proof. Illustrative marketing copy, not DB-backed. */
export function Testimonials() {
  const quotes = [
    {
      name: "أم فيصل",
      role: "ورشة أم فيصل للعبايات — مكة المكرمة",
      quote: "وصلني تجار ما كنت أعرفهم من قبل، والتوثيق زاد ثقة الناس فينا.",
    },
    {
      name: "نور القحطاني",
      role: "متجر نور — جدة",
      quote: "قارنت الأسعار من عدة موردين بدقائق بدل ما أرسل نفس الرسالة في كل مجموعة واتساب.",
    },
    {
      name: "أبو تركي",
      role: "مصنع أبو تركي للعبايات — الرياض",
      quote: "طلبات الشراء منظمة وواضحة، صار وقت الرد أسرع بكثير.",
    },
  ];

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {quotes.map((item) => (
          <figure key={item.name} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
            <Quote className="size-6 text-primary/50" aria-hidden />
            <blockquote className="flex-1 text-sm text-foreground">{item.quote}</blockquote>
            <figcaption className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{item.name}</span> — {item.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
