/**
 * The abaya-specific attribute taxonomy: single source of truth for the
 * Category/AttributeDefinition/AttributeOption rows seeded into the DB
 * (prisma/seed.ts) and for the Marketplace filter UI (Phase 7).
 *
 * Mirrors the attribute table in docs/AI-SYSTEM-touq.md #3.6.
 */

export const ROOT_CATEGORY_SLUG = "abaya";

export interface AttributeOptionSeed {
  key: string;
  valueAr: string;
  valueEn: string;
}

export interface AttributeDefinitionSeed {
  key: string;
  labelAr: string;
  labelEn: string;
  type: "ENUM" | "TEXT" | "NUMBER";
  isFilterable: boolean;
  options?: AttributeOptionSeed[];
}

export const ABAYA_ATTRIBUTES: AttributeDefinitionSeed[] = [
  {
    key: "fabric",
    labelAr: "القماش",
    labelEn: "Fabric",
    type: "ENUM",
    isFilterable: true,
    options: [
      { key: "nada", valueAr: "ندى", valueEn: "Nada" },
      { key: "crepe", valueAr: "كريب", valueEn: "Crepe" },
      { key: "japanese_crepe", valueAr: "كريب ياباني", valueEn: "Japanese Crepe" },
      { key: "chiffon", valueAr: "شيفون", valueEn: "Chiffon" },
      { key: "korean", valueAr: "قماش كوري", valueEn: "Korean Fabric" },
      { key: "cotton_blend", valueAr: "قطن مخلوط", valueEn: "Cotton Blend" },
      { key: "silk_blend", valueAr: "حرير مخلوط", valueEn: "Silk Blend" },
      { key: "linen", valueAr: "كتان", valueEn: "Linen" },
    ],
  },
  {
    key: "style",
    labelAr: "القصة",
    labelEn: "Style/Cut",
    type: "ENUM",
    isFilterable: true,
    options: [
      { key: "classic", valueAr: "كلاسيكي مغلق", valueEn: "Classic (Closed)" },
      { key: "open_farasha", valueAr: "مفتوح فراشة", valueEn: "Open-Front (Farasha/Butterfly)" },
      { key: "kimono", valueAr: "كيمونو", valueEn: "Kimono" },
      { key: "wrap", valueAr: "لفة", valueEn: "Wrap" },
      { key: "layered", valueAr: "طبقات", valueEn: "Layered" },
    ],
  },
  {
    key: "sleeve",
    labelAr: "الأكمام",
    labelEn: "Sleeves",
    type: "ENUM",
    isFilterable: true,
    options: [
      { key: "fitted", valueAr: "ضيق", valueEn: "Fitted/Narrow" },
      { key: "wide_bell", valueAr: "واسع جرسي", valueEn: "Wide/Bell" },
      { key: "dolman", valueAr: "دولمان", valueEn: "Dolman" },
      { key: "batwing", valueAr: "خفاش", valueEn: "Batwing" },
      { key: "cuffed", valueAr: "بأساور", valueEn: "Cuffed" },
      { key: "ruffled", valueAr: "مكشكش", valueEn: "Ruffled" },
    ],
  },
  {
    key: "color",
    labelAr: "اللون",
    labelEn: "Color",
    type: "ENUM",
    isFilterable: true,
    options: [
      { key: "black", valueAr: "أسود", valueEn: "Black" },
      { key: "navy", valueAr: "كحلي", valueEn: "Navy" },
      { key: "beige", valueAr: "بيج", valueEn: "Beige" },
      { key: "emerald", valueAr: "زمردي", valueEn: "Emerald" },
      { key: "burgundy", valueAr: "خمري", valueEn: "Burgundy" },
      { key: "dusty_rose", valueAr: "وردي ترابي", valueEn: "Dusty Rose" },
      { key: "brown", valueAr: "بني", valueEn: "Brown" },
      { key: "multi_tone", valueAr: "متعدد الألوان", valueEn: "Multi-tone" },
    ],
  },
  {
    key: "embroidery",
    labelAr: "التطريز",
    labelEn: "Embroidery",
    type: "ENUM",
    isFilterable: true,
    options: [
      { key: "none", valueAr: "بدون", valueEn: "None" },
      { key: "chest", valueAr: "الصدر", valueEn: "Chest" },
      { key: "sleeve", valueAr: "الأكمام", valueEn: "Sleeve" },
      { key: "hem", valueAr: "الذيل", valueEn: "Hem" },
      { key: "all_over", valueAr: "شامل", valueEn: "All-over" },
      { key: "beadwork", valueAr: "خرز وكريستال", valueEn: "Beadwork/Crystal" },
      { key: "printed", valueAr: "مطبوع", valueEn: "Printed Pattern" },
    ],
  },
  {
    key: "category",
    labelAr: "التصنيف",
    labelEn: "Category",
    type: "ENUM",
    isFilterable: true,
    options: [
      { key: "everyday", valueAr: "يومي", valueEn: "Everyday/Casual" },
      { key: "occasion", valueAr: "مناسبات", valueEn: "Occasion/Formal" },
      { key: "bridal", valueAr: "زفاف", valueEn: "Bridal" },
      { key: "prayer", valueAr: "صلاة", valueEn: "Prayer Abaya" },
    ],
  },
  {
    key: "season",
    labelAr: "الموسم",
    labelEn: "Season",
    type: "ENUM",
    isFilterable: true,
    options: [
      { key: "summer", valueAr: "صيفي خفيف", valueEn: "Lightweight/Summer" },
      { key: "transitional", valueAr: "متوسط", valueEn: "Mid-weight/Transitional" },
      { key: "winter", valueAr: "شتوي ثقيل", valueEn: "Heavyweight/Winter" },
    ],
  },
];

export const REGIONS_SEED = {
  countryAr: "المملكة العربية السعودية",
  countryEn: "Saudi Arabia",
  cities: [
    { key: "riyadh", nameAr: "الرياض", nameEn: "Riyadh" },
    { key: "jeddah", nameAr: "جدة", nameEn: "Jeddah" },
    { key: "makkah", nameAr: "مكة المكرمة", nameEn: "Makkah" },
    { key: "al_ahsa", nameAr: "الأحساء", nameEn: "Al-Ahsa" },
  ],
} as const;
