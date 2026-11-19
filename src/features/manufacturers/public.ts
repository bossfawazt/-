import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** المصانع الشريكة المعتمدة والمعلنة فقط (بدون بيانات اختبار). */
export async function getPublicManufacturers() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("list_public_manufacturers");
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
