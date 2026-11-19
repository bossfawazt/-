import { z } from "zod";
import { normalizeSaudiMobile, toLatinDigits } from "./phone";

export const saudiMobileSchema = z
  .string()
  .trim()
  .min(1, "أدخل رقم الجوال")
  .transform((v, ctx) => {
    const n = normalizeSaudiMobile(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "أدخل رقم جوال سعودي صحيح يبدأ بـ 05" });
      return z.NEVER;
    }
    return n;
  });

export const otpSchema = z
  .string()
  .trim()
  .transform((v) => toLatinDigits(v))
  .pipe(z.string().regex(/^\d{6}$/, "رمز التحقق مكوّن من 6 أرقام"));

export const safeNextPath = (value: unknown): string => {
  // يمنع إعادة التوجيه لمواقع خارجية (open redirect)
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "";
  }
  return value;
};

export const profileCompletionSchema = z.object({
  fullName: z.string().trim().min(2, "أدخل الاسم").max(120, "الاسم طويل جداً"),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.email("بريد إلكتروني غير صحيح").optional()),
  consent: z.literal("on", { error: "يجب الموافقة على معالجة البيانات للمتابعة" }),
  marketingConsent: z.literal("on").optional(),
});

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "أدخل الاسم").max(120),
  phone: saudiMobileSchema,
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.email("بريد إلكتروني غير صحيح").optional()),
  topic: z.enum(["general", "partnership", "support", "other"]),
  message: z.string().trim().min(10, "اكتب رسالة لا تقل عن 10 أحرف").max(2000, "الرسالة طويلة جداً"),
  // حقل مصيدة للروبوتات: يجب أن يبقى فارغاً
  website: z.string().max(0).optional(),
});

export const newProjectSchema = z.object({
  name: z.string().trim().min(2, "أدخل اسماً للمشروع").max(120),
  city: z.literal("الرياض", { error: "الخدمة متاحة حالياً في الرياض فقط" }),
  district: z.string().trim().min(2, "أدخل اسم الحي").max(80),
  propertyType: z.enum(["villa", "apartment", "duplex", "floor", "other"]),
  workType: z.enum(["new", "renovation"]),
  description: z.string().trim().max(2000, "الوصف طويل جداً").optional(),
});
