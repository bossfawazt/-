"use server";

import { fieldErrorsFrom, formValues, type FormValues } from "@/lib/forms";
import { getCurrentProfile } from "@/lib/auth/session";
import { getClientIpHash } from "@/lib/security/request";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validation/schemas";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: FormValues;
};

const MAX_PER_HOUR = 3;

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    topic: formData.get("topic"),
    message: formData.get("message"),
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error.issues), message: "راجع الحقول المظللة.", values: formValues(formData) };
  }

  if (!isAdminClientConfigured()) {
    return { status: "error", message: "استقبال الرسائل غير مفعّل بعد (يلزم إعداد Supabase). تواصل معنا هاتفياً مؤقتاً.", values: formValues(formData) };
  }

  const admin = createAdminClient();
  const ipHash = await getClientIpHash();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return { status: "error", message: "أرسلت عدة رسائل مؤخراً. حاول مرة أخرى بعد ساعة.", values: formValues(formData) };
  }

  const profile = await getCurrentProfile();
  const { error } = await admin.from("contact_messages").insert({
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email ?? null,
    topic: parsed.data.topic,
    message: parsed.data.message,
    user_id: profile?.id ?? null,
    ip_hash: ipHash,
  });
  if (error) return { status: "error", message: "تعذر إرسال الرسالة. حاول مرة أخرى.", values: formValues(formData) };

  return { status: "success", message: "وصلتنا رسالتك، وسنتواصل معك قريباً." };
}
