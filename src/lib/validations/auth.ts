import { z } from "zod";

/**
 * Shared auth schemas — consumed by both the client forms (React Hook Form +
 * @hookform/resolvers/zod) and the API route handlers, so validation rules
 * can never drift between client and server (docs/UIUX-touq.md #C.12).
 */

// Saudi mobile numbers: +9665XXXXXXXX (9 digits after the country code, starting with 5).
export const saudiPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+9665\d{8}$/, "أدخل رقم جوال سعودي صحيح (مثال: 966501234567+)");

export const otpCodeSchema = z
  .string()
  .trim()
  .length(6, "رمز التحقق مكوّن من 6 أرقام")
  .regex(/^\d{6}$/, "رمز التحقق أرقام فقط");

export const organizationTypeSchema = z.enum(["SUPPLIER", "MERCHANT"]);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا").max(100),
  phone: saudiPhoneSchema,
  organizationType: organizationTypeSchema,
  businessNameAr: z.string().trim().min(2, "اسم المنشأة قصير جدًا").max(150),
  agreeToTerms: z.literal(true, {
    error: "يجب الموافقة على الشروط وسياسة الخصوصية للمتابعة",
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const otpVerifySchema = z.object({
  phone: saudiPhoneSchema,
  code: otpCodeSchema,
  purpose: z.enum(["REGISTER", "LOGIN"]),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

export const otpSendSchema = z.object({
  phone: saudiPhoneSchema,
  purpose: z.enum(["REGISTER", "LOGIN"]),
});
export type OtpSendInput = z.infer<typeof otpSendSchema>;

export const passwordLoginSchema = z.object({
  phone: saudiPhoneSchema,
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
});
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;

export const businessDetailsSchema = z.object({
  legalNameAr: z.string().trim().min(2).max(150),
  legalNameEn: z.string().trim().max(150).optional().or(z.literal("")),
  crNumber: z.string().trim().min(4, "رقم السجل التجاري غير صحيح").max(20),
  maroofId: z.string().trim().max(50).optional().or(z.literal("")),
  regionId: z.string().uuid("اختر المنطقة"),
  city: z.string().trim().min(2, "أدخل المدينة"),
  descriptionAr: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;
