import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { footerLinks, siteConfig } from "@/config/site";

export function SiteFooter() {
  const { phone, whatsapp, email } = siteConfig.contact;
  return (
    <footer className="mt-auto border-t border-border bg-[var(--ivory-deep)]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo showTagline />
          <p className="mt-4 text-sm text-muted-foreground">
            منصة وسيطة تربطك بمصانع مطابخ موثوقة في {siteConfig.launchCity}. المصنع مسؤول عن القياس النهائي والتصنيع
            والتركيب والضمان وفق العقد.
          </p>
          {phone || whatsapp || email ? (
            <ul className="mt-4 space-y-1 text-sm">
              {phone ? (
                <li>
                  هاتف: <a className="underline-offset-4 hover:underline" dir="ltr" href={`tel:${phone}`}>{phone}</a>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  واتساب:{" "}
                  <a className="underline-offset-4 hover:underline" dir="ltr" href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}>
                    {whatsapp}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  البريد: <a className="underline-offset-4 hover:underline" href={`mailto:${email}`}>{email}</a>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
        {footerLinks.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold text-foreground">{group.title}</h2>
            <ul className="mt-3 space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-10 items-center text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. جميع الحقوق محفوظة.</p>
          <p>الخدمة متاحة حالياً في {siteConfig.launchCity} — المطابخ فقط.</p>
        </div>
      </div>
    </footer>
  );
}
