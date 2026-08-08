import Link from "next/link";
import { ABAYA_ATTRIBUTES } from "@/lib/taxonomy";

/** docs/UIUX-touq.md #C.1 section 4: style tiles linking into the filtered Marketplace. */
export function CategoryTiles() {
  const styleAttribute = ABAYA_ATTRIBUTES.find((attr) => attr.key === "style");
  const options = styleAttribute?.options ?? [];

  return (
    <section className="border-y border-border bg-card py-14">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold text-foreground">تصفح حسب القصة</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {options.map((option) => (
            <Link
              key={option.key}
              href={`/marketplace?style=${option.key}`}
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span className="text-sm font-semibold text-foreground group-hover:text-primary">{option.valueAr}</span>
              <span className="text-xs text-muted-foreground">{option.valueEn}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
