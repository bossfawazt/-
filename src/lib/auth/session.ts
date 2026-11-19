import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/roles";

export type CurrentProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  city: string;
  role: AppRole;
  isActive: boolean;
  hasConsent: boolean;
};

/** المستخدم الحالي وملفه (مخزّن مؤقتاً لكل طلب). يعيد null لغير المسجل. */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  // صفحات تعتمد على المستخدم تُعرض لكل طلب ولا تُبنى مسبقاً
  await connection();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, city, role, is_active, data_processing_consent_at")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
    city: data.city,
    role: data.role as AppRole,
    isActive: data.is_active,
    hasConsent: Boolean(data.data_processing_consent_at),
  };
});

/** يتطلب مستخدماً مسجلاً ونشطاً؛ وإلا يعيد التوجيه لصفحة الدخول. */
export async function requireUser(nextPath = "/account"): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!profile.isActive) redirect("/login?error=inactive");
  return profile;
}

/** يتطلب أحد الأدوار المحددة — يُطبق في الخادم وليس بإخفاء الأزرار فقط. */
export async function requireRole(roles: readonly AppRole[], nextPath = "/"): Promise<CurrentProfile> {
  const profile = await requireUser(nextPath);
  if (!roles.includes(profile.role)) redirect("/account?error=forbidden");
  return profile;
}
