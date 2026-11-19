export const siteConfig = {
  name: "معمار المنزل",
  tagline: "صمّم منزلك قبل أن تنفذه",
  description:
    "صمم مطبخك بالذكاء الاصطناعي، اختر التفاصيل، واحصل على عرض سعر من مصانع موثوقة في الرياض.",
  launchCity: "الرياض",
  // ضع رقم ووسائل التواصل الرسمية هنا عند اعتمادها. تُخفى في الواجهة إن كانت فارغة.
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
    whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  },
} as const;

export type NavItem = { href: string; label: string };

export const mainNav: NavItem[] = [
  { href: "/", label: "الرئيسية" },
  { href: "/design", label: "صمم مطبخك" },
  { href: "/how-it-works", label: "كيف تعمل المنصة؟" },
  { href: "/gallery", label: "تصاميم المطابخ" },
  { href: "/contact", label: "تواصل معنا" },
];

export const footerLinks: { title: string; links: NavItem[] }[] = [
  {
    title: "المنصة",
    links: [
      { href: "/design", label: "صمم مطبخك" },
      { href: "/how-it-works", label: "كيف تعمل المنصة؟" },
      { href: "/gallery", label: "تصاميم المطابخ" },
    ],
  },
  {
    title: "الشركاء",
    links: [
      { href: "/contact?topic=partnership", label: "انضم كمصنع شريك" },
      { href: "/contact", label: "تواصل معنا" },
    ],
  },
  {
    title: "السياسات",
    links: [
      { href: "/legal/privacy", label: "سياسة الخصوصية" },
      { href: "/legal/terms", label: "شروط الاستخدام" },
    ],
  },
];
