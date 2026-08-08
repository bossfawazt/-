import Link from "next/link";
import { Button } from "@/components/ui/button";

/** docs/UIUX-touq.md #C.1 section 9: closing CTA band. */
export function CtaBanner() {
  return (
    <section className="bg-foreground">
      <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-background sm:text-3xl">جاهز لتنمية تجارتك؟</h2>
        <p className="max-w-md text-sm text-background/70">انضم إلى توق اليوم — تسجيل مجاني للموردين، وتصفح فوري للتجار.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">انضم كمورد</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="border-background/40 text-background hover:bg-background/10">
            <Link href="/marketplace">تصفح كتاجر</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
