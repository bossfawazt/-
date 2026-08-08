import Link from "next/link";
import { ShieldCheck } from "lucide-react";

/** docs/UIUX-touq.md #B.2: multi-column footer, collapses to stacked sections on mobile. */
export function PublicFooter() {
  const columns = [
    {
      title: "للتجار",
      links: [
        { label: "تصفح السوق", href: "/marketplace" },
        { label: "إنشاء حساب تاجر", href: "/register" },
      ],
    },
    {
      title: "للموردين",
      links: [
        { label: "انضم كمورد", href: "/register" },
        { label: "تسجيل الدخول", href: "/login" },
      ],
    },
    {
      title: "الشركة",
      links: [
        { label: "من نحن", href: "/#how-it-works" },
        { label: "تواصل معنا", href: "mailto:support@touq.sa" },
      ],
    },
    {
      title: "قانوني",
      links: [
        { label: "الشروط والأحكام", href: "/legal/terms" },
        { label: "سياسة الخصوصية", href: "/legal/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <span className="font-display text-xl font-bold text-foreground">توق</span>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              سوق الجملة الموثوق للعبايات في المملكة العربية السعودية.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} توق. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            متوافق مع نظام حماية البيانات الشخصية السعودي
          </div>
        </div>
      </div>
    </footer>
  );
}
