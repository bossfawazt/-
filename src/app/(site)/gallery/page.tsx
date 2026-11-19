import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CtaBand, GalleryCard } from "@/features/home/sections";
import { galleryConcepts } from "@/features/gallery/designs";

export const metadata: Metadata = { title: "تصاميم المطابخ" };

export default function GalleryPage() {
  return (
    <>
      <PageHeader eyebrow="معرض التصاميم" title="تصاميم المطابخ" description="رسومات توضيحية للأنماط المتاحة على المنصة. التصور الخاص بمطبخك يُولد من صورك ومقاساتك واختياراتك." />
      <section className="py-12">
        <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryConcepts.map((d) => (
            <GalleryCard key={d.key} concept={d} />
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
