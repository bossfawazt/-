import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/features/contact/contact-form";

export const metadata: Metadata = { title: "تواصل معنا" };

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { topic } = await searchParams;
  const isPartner = topic === "partnership";
  return (
    <>
      <PageHeader
        eyebrow="تواصل معنا"
        title={isPartner ? "انضم كمصنع شريك" : "يسعدنا تواصلك"}
        description={
          isPartner
            ? "نبحث عن مصانع مطابخ في الرياض بجودة موثوقة والتزام بالمواعيد. أرسل بياناتك وسنتواصل معك لترتيب الاتفاقية."
            : `فريقنا يرد على الاستفسارات في ${siteConfig.launchCity} خلال أوقات العمل.`
        }
      />
      <section className="py-12">
        <div className="container-page max-w-3xl">
          <ContactForm defaultTopic={typeof topic === "string" ? topic : "general"} />
        </div>
      </section>
    </>
  );
}
