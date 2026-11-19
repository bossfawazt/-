import "server-only";

/** متغيرات سرية — لا تُستورد أبداً في مكونات العميل. */
export const serverEnv = {
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  aiProvider: process.env.AI_IMAGE_PROVIDER ?? "",
  enableDevLogin: process.env.ENABLE_DEV_LOGIN === "true",
};

/**
 * دخول الاختبار: يعمل فقط عند تحقق الشرطين معاً:
 * 1) البيئة ليست إنتاجاً (NODE_ENV !== "production")
 * 2) ENABLE_DEV_LOGIN=true صراحة
 * أي نشر على Vercel (حتى المعاينة) يعمل بـ NODE_ENV=production فلا يُفعّل أبداً.
 */
export function isDevLoginEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && serverEnv.enableDevLogin;
}
