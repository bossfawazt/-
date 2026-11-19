"use server";

import { redirect } from "next/navigation";
import { fieldErrorsFrom, formValues, type FormValues } from "@/lib/forms";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { newProjectSchema } from "@/lib/validation/schemas";

export type ProjectFormState = { error?: string; fieldErrors?: Record<string, string>; values?: FormValues };

/** الخطوة الأولى في المعالج: إنشاء المشروع (يُحفظ كمسودة ويمكن إكماله لاحقاً) */
export async function createProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const profile = await requireUser("/design");

  const parsed = newProjectSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    district: formData.get("district"),
    propertyType: formData.get("propertyType"),
    workType: formData.get("workType"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues), values: formValues(formData) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      customer_id: profile.id, // RLS يتحقق أيضاً أن المالك هو المستخدم الحالي
      name: parsed.data.name,
      city: parsed.data.city,
      district: parsed.data.district,
      property_type: parsed.data.propertyType,
      work_type: parsed.data.workType,
      description: parsed.data.description ?? null,
      current_step: 2,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "تعذر إنشاء المشروع. حاول مرة أخرى.", values: formValues(formData) };

  redirect(`/account/projects/${data.id}?created=1`);
}
