import { Info } from "lucide-react";

/** رسالة واضحة عند نقص إعداد خدمة خارجية — بدلاً من أزرار شكلية لا تعمل */
export function SetupNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-info/30 bg-info/10 p-4 text-sm">
      <Info className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <div className="mt-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
