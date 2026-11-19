"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { isDevLoginEnabled } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { otpSchema, profileCompletionSchema, safeNextPath, saudiMobileSchema } from "@/lib/validation/schemas";
import { fieldErrorsFrom, formValues, type FormValues } from "@/lib/forms";
import { APP_ROLES, homePathForRole, type AppRole } from "@/types/roles";

export type AuthFormState = {
  step: "phone" | "otp";
  phone?: string;
  rawPhone?: string;
  error?: string;
  info?: string;
};

const NOT_CONFIGURED = "خدمة الدخول غير مفعلة بعد: يلزم إعداد Supabase (راجع README).";

function mapAuthError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("rate") || m.includes("security purposes")) return "محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.";
  if (m.includes("expired") || m.includes("invalid")) return "رمز التحقق غير صحيح أو منتهي الصلاحية.";
  if (m.includes("sms") || m.includes("provider") || m.includes("phone")) {
    return "تعذر إرسال الرسالة. مزود الرسائل النصية غير مضبوط بعد أو الرقم غير مدعوم.";
  }
  return "حدث خطأ غير متوقع. حاول مرة أخرى.";
}

/** الخطوة 1: إرسال رمز التحقق إلى الجوال */
export async function requestOtp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { step: "phone", error: NOT_CONFIGURED };

  const rawPhone = String(formData.get("phone") ?? "").slice(0, 20);
  const parsed = saudiMobileSchema.safeParse(rawPhone);
  if (!parsed.success) return { step: "phone", rawPhone, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone: parsed.data, options: { channel: "sms" } });
  if (error) return { step: "phone", rawPhone, error: mapAuthError(error.message) };

  return { step: "otp", phone: parsed.data, info: "أرسلنا رمز التحقق إلى جوالك." };
}

/** الخطوة 2: التحقق من الرمز وإنشاء الجلسة */
export async function verifyOtp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { step: "phone", error: NOT_CONFIGURED };

  const phone = saudiMobileSchema.safeParse(formData.get("phone"));
  if (!phone.success) return { step: "phone", error: "أعد إدخال رقم الجوال." };
  const token = otpSchema.safeParse(formData.get("token"));
  if (!token.success) return { step: "otp", phone: phone.data, error: token.error.issues[0]?.message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ phone: phone.data, token: token.data, type: "sms" });
  if (error || !data.user) return { step: "otp", phone: phone.data, error: mapAuthError(error?.message) };

  await redirectAfterLogin(data.user.id, safeNextPath(formData.get("next")));
  return { step: "otp" };
}

async function redirectAfterLogin(userId: string, next: string): Promise<never> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, data_processing_consent_at")
    .eq("id", userId)
    .maybeSingle();

  // إكمال الملف والموافقة على معالجة البيانات قبل أي استخدام
  if (!profile?.full_name || !profile.data_processing_consent_at) {
    redirect(`/account/complete-profile${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  redirect(next || homePathForRole(profile.role as AppRole));
}

export type ProfileFormState = { error?: string; fieldErrors?: Record<string, string>; values?: FormValues };

/** إكمال الملف الشخصي + موافقة معالجة البيانات (إلزامية) والتسويق (اختيارية ومستقلة) */
export async function completeProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login");

  const parsed = profileCompletionSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    consent: formData.get("consent") ?? undefined,
    marketingConsent: formData.get("marketingConsent") ?? undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues), values: formValues(formData) };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email ?? null,
      data_processing_consent_at: new Date().toISOString(),
      marketing_consent: parsed.data.marketingConsent === "on",
    })
    .eq("id", userId);
  if (error) return { error: "تعذر حفظ البيانات. حاول مرة أخرى.", values: formValues(formData) };

  await redirectAfterLogin(userId, safeNextPath(formData.get("next")));
  return {};
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

/**
 * دخول الاختبار للتطوير المحلي فقط (لا يعمل في الإنتاج إطلاقاً — راجع isDevLoginEnabled).
 * ينشئ حساب اختبار لكل دور ويُدخل المستخدم دون رسائل SMS.
 */
export async function devLogin(formData: FormData) {
  if (!isDevLoginEnabled()) throw new Error("Dev login is disabled");

  const role = String(formData.get("role")) as AppRole;
  if (!APP_ROLES.includes(role)) throw new Error("Invalid role");

  const admin = createAdminClient();
  const email = `dev-${role}@mimar.test`;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: `حساب اختبار (${role})` },
  });
  if (createError && !/already|exists|registered/i.test(createError.message)) throw createError;

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (linkError || !link.properties?.hashed_token) throw linkError ?? new Error("Failed to create dev link");

  const userId = created?.user?.id ?? link.user.id;
  await admin
    .from("profiles")
    .update({ role, full_name: `حساب اختبار (${role})`, data_processing_consent_at: new Date().toISOString() })
    .eq("id", userId);

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: link.properties.hashed_token });
  if (error) throw error;

  redirect(homePathForRole(role));
}

/** نقطة دخول واحدة لنموذج الدخول ذي الخطوتين */
export async function authStep(prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  // زر "إعادة الإرسال" يضيف intent ثانياً؛ آخر قيمة هي الزر المضغوط
  if (formData.getAll("intent").at(-1) === "verify") return verifyOtp(prev, formData);
  return requestOtp(prev, formData);
}
