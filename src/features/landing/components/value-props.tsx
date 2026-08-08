import { ShieldCheck, Sparkles, Store } from "lucide-react";

/** docs/UIUX-touq.md #C.1 section 3: three-column value proposition. */
export function ValueProps() {
  const items = [
    {
      icon: Store,
      title: "للتجار",
      description: "تصفح مئات المنتجات من موردين موثقين، وقارن الأسعار والحد الأدنى للطلب في مكان واحد بدل مجموعات واتساب.",
    },
    {
      icon: ShieldCheck,
      title: "للموردين",
      description: "سجّل مجانًا واعرض منتجاتك أمام تجار جدد كل يوم — بدون رسوم اشتراك للانضمام والبدء بالبيع.",
    },
    {
      icon: Sparkles,
      title: "لماذا توق",
      description: "منصة متخصصة في العبايات فقط — تصنيف دقيق للقماش والقصة والتطريز، وتوثيق حقيقي للمنشآت.",
    },
  ];

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex flex-col items-start gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
