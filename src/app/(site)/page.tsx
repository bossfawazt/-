import { CtaBand, Faq, Features, GalleryPreview, Hero, HowItWorks, PartnersSection } from "@/features/home/sections";
import { getPublicManufacturers } from "@/features/manufacturers/public";

export default async function HomePage() {
  const partners = await getPublicManufacturers();
  return (
    <>
      <Hero />
      <HowItWorks />
      <GalleryPreview />
      <Features />
      <PartnersSection partners={partners} />
      <Faq />
      <CtaBand />
    </>
  );
}
