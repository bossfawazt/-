import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroProps {
  supplierCount: number;
  productCount: number;
  cityCount: number;
}

/** docs/UIUX-touq.md #C.1 section 2: hero with dual CTA + trust-indicator row. */
export function Hero({ supplierCount, productCount, cityCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 to-background">
      <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
          منصة B2B متخصصة في العبايات
        </span>
        <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          مصدر الجملة الموثوق للعبايات
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          توق تربط موردي العبايات بالتجار الإلكترونيين في المملكة العربية السعودية — تسجيل مجاني للموردين، وتصفح فوري للتجار.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">انضم كمورد</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/marketplace">تصفح كتاجر</Link>
          </Button>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-8 border-t border-border pt-6 text-center">
          <div>
            <dt className="sr-only">عدد الموردين الموثقين</dt>
            <dd className="text-2xl font-bold text-foreground">{supplierCount}+</dd>
            <span className="text-xs text-muted-foreground">مورد موثّق</span>
          </div>
          <div>
            <dt className="sr-only">عدد المنتجات</dt>
            <dd className="text-2xl font-bold text-foreground">{productCount}+</dd>
            <span className="text-xs text-muted-foreground">منتج</span>
          </div>
          <div>
            <dt className="sr-only">عدد المدن</dt>
            <dd className="text-2xl font-bold text-foreground">{cityCount}+</dd>
            <span className="text-xs text-muted-foreground">مدينة</span>
          </div>
        </dl>
      </div>
    </section>
  );
}
