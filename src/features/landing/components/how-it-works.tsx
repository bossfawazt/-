import { CheckCircle2, MessageSquareText, PackageSearch, ShieldCheck, Truck, UserPlus } from "lucide-react";

/** docs/UIUX-touq.md #C.1 section 6: numbered horizontal timeline. */
export function HowItWorks() {
  const steps = [
    { icon: UserPlus, title: "التسجيل", description: "أنشئ حسابك كمورد أو تاجر خلال دقائق." },
    { icon: ShieldCheck, title: "التوثيق", description: "أكمل بيانات منشأتك ليتم توثيقها من فريق توق." },
    { icon: PackageSearch, title: "التصفح أو العرض", description: "تصفح المنتجات أو اعرض منتجاتك للتجار." },
    { icon: MessageSquareText, title: "طلب / عرض السعر", description: "أرسل طلب شراء أو استلم عروض أسعار مباشرة." },
    { icon: CheckCircle2, title: "التفاوض", description: "تفاوض على الكمية والسعر داخل المنصة." },
    { icon: Truck, title: "تنفيذ الطلب", description: "تابع حالة الطلب حتى التسليم." },
  ];

  return (
    <section id="how-it-works" className="border-y border-border bg-card py-16">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-xl font-semibold text-foreground">كيف تعمل المنصة</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col items-center gap-2 text-center">
                <div className="relative flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden />
                  <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
