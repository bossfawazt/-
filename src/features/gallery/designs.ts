import type { CountertopKind, KitchenStyle } from "@/components/illustrations/kitchen-illustration";

/**
 * تصورات توضيحية لأنماط المطابخ المتاحة في المنصة.
 * رسومات متجهية للتعريف بالأنماط — ليست أعمالاً منفذة ولا نواتج ذكاء اصطناعي.
 * عند توفر صور مشاريع حقيقية بإذن أصحابها تُستبدل بمعرض من قاعدة البيانات.
 */
export type GalleryConcept = {
  key: string;
  title: string;
  styleLabel: string;
  description: string;
  style: KitchenStyle;
  cabinetColor: string;
  upperColor?: string;
  countertop: CountertopKind;
  wallColor: string;
  withIsland: boolean;
  tags: string[];
};

export const galleryConcepts: GalleryConcept[] = [
  {
    key: "modern-sage",
    title: "مودرن بلمسة خضراء",
    styleLabel: "مودرن",
    description: "واجهات ملساء بدون مقابض، خزائن سفلية خضراء وعلوية بيج، وسطح كوارتز فاتح.",
    style: "modern",
    cabinetColor: "#3F5A4A",
    upperColor: "#E9E1D3",
    countertop: "quartz",
    wallColor: "#EFE9DF",
    withIsland: true,
    tags: ["أخضر", "كوارتز", "جزيرة"],
  },
  {
    key: "neo-classic-ivory",
    title: "نيو كلاسيك عاجي",
    styleLabel: "نيو كلاسيك",
    description: "أبواب بإطارات ناعمة ومقابض نحاسية وسطح رخامي بعروق هادئة.",
    style: "neo_classic",
    cabinetColor: "#F1ECE2",
    countertop: "marble",
    wallColor: "#E8E0D2",
    withIsland: true,
    tags: ["أبيض", "رخام", "نحاسي"],
  },
  {
    key: "minimal-stone",
    title: "مينيمال رمادي حجري",
    styleLabel: "مينيمال",
    description: "خطوط نظيفة وأجهزة مدمجة ومساحات هادئة دون تفاصيل زائدة.",
    style: "minimal",
    cabinetColor: "#B4AFA6",
    upperColor: "#D9D4CB",
    countertop: "quartz",
    wallColor: "#EEEAE3",
    withIsland: false,
    tags: ["رمادي", "بدون مقابض"],
  },
  {
    key: "luxury-walnut",
    title: "فاخر خشبي دافئ",
    styleLabel: "فاخر",
    description: "خشب داكن مع لمسات ذهبية وإضاءة معلقة وسطح رخامي على الجزيرة.",
    style: "luxury",
    cabinetColor: "#6E4B33",
    upperColor: "#E7DCCB",
    countertop: "marble",
    wallColor: "#EAE2D6",
    withIsland: true,
    tags: ["خشبي", "ذهبي", "رخام"],
  },
  {
    key: "classic-beige",
    title: "كلاسيك بيج",
    styleLabel: "كلاسيك",
    description: "حشوات بارزة وكرانيش علوية ومقابض دائرية لطابع تقليدي أنيق.",
    style: "classic",
    cabinetColor: "#DCCDB3",
    countertop: "granite",
    wallColor: "#F0E9DD",
    withIsland: false,
    tags: ["بيج", "جرانيت"],
  },
  {
    key: "modern-black",
    title: "مودرن أسود مطفي",
    styleLabel: "مودرن",
    description: "تباين جريء بين الأسود المطفي والسطح الفاتح مع إضاءة مخفية.",
    style: "modern",
    cabinetColor: "#2A2927",
    upperColor: "#E6E0D6",
    countertop: "quartz",
    wallColor: "#ECE6DC",
    withIsland: true,
    tags: ["أسود", "كوارتز"],
  },
];
