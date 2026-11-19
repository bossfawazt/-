export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="border-b border-border bg-[var(--ivory-deep)]">
      <div className="container-page py-10 sm:py-14">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p> : null}
      </div>
    </section>
  );
}
