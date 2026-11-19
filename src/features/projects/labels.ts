import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];

export const PROPERTY_TYPE_LABELS: Record<Enums["property_type"], string> = {
  villa: "فيلا",
  apartment: "شقة",
  duplex: "دوبلكس",
  floor: "دور مستقل",
  other: "أخرى",
};

export const WORK_TYPE_LABELS: Record<Enums["kitchen_work_type"], string> = {
  new: "مطبخ جديد",
  renovation: "تجديد مطبخ قائم",
};

export const PROJECT_STATUS_LABELS: Record<Enums["project_status"], string> = {
  draft: "قيد الإعداد",
  designing: "في مرحلة التصميم",
  design_ready: "التصميم جاهز",
  submitted: "تم طلب المعاينة",
  archived: "مؤرشف",
};

export const WIZARD_STEPS = [
  "معلومات المشروع",
  "رفع الصور",
  "المقاسات",
  "اختيار التصميم",
  "التصور بالذكاء الاصطناعي",
  "ملخص الطلب",
] as const;
