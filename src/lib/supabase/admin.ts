import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/types/database";

/**
 * عميل بصلاحيات الخادم الكاملة (يتجاوز RLS).
 * يُستخدم فقط بعد التحقق من صلاحية المستخدم في الكود، ولعمليات النظام
 * (الإشعارات، سجل العمليات، حفظ الصور المولدة). لا يصل للمتصفح أبداً.
 */
export function createAdminClient() {
  if (!publicEnv.supabaseUrl || !serverEnv.supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY غير مضبوط في متغيرات الخادم");
  }
  return createClient<Database>(publicEnv.supabaseUrl, serverEnv.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminClientConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && serverEnv.supabaseSecretKey);
}
