import { PageHeader } from "./page-header";

export type LegalSection = { title: string; body: (string | string[])[] };

export function LegalDoc({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHeader eyebrow="السياسات" title={title} description={`آخر تحديث: ${updated}`} />
      <article className="container-page max-w-3xl py-10">
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm text-foreground">
          مسودة أولية لأغراض الإطلاق التجريبي، وتخضع للمراجعة القانونية قبل الإطلاق التجاري.
        </p>
        <div className="mt-8 space-y-9">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 space-y-3 leading-8 text-muted-foreground">
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul key={j} className="list-disc space-y-1.5 ps-5">
                      {b.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{b}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
