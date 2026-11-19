/**
 * قراءة متغيرات البيئة العامة (الآمنة للمتصفح).
 * المفاتيح السرية في src/lib/env.server.ts فقط.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  // المفتاح العام (publishable) أو المفتاح القديم anon — كلاهما آمن للمتصفح مع RLS
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** هل إعدادات Supabase متوفرة؟ عند عدم توفرها تعمل الصفحات العامة وتظهر رسالة إعداد واضحة. */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey);
}
