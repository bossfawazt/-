"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createProject, type ProjectFormState } from "./actions";
import { PROPERTY_TYPE_LABELS, WORK_TYPE_LABELS } from "./labels";

export function NewProjectForm() {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(createProject, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values;

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field id="name" label="اسم المشروع" hint="مثال: مطبخ فيلا الملقا" error={fe.name} className="sm:col-span-2">
        <Input name="name" required maxLength={120} defaultValue={v?.name} />
      </Field>
      <Field id="city" label="المدينة" hint="الخدمة متاحة حالياً في الرياض فقط" error={fe.city}>
        <NativeSelect name="city" defaultValue="الرياض">
          <option value="الرياض">الرياض</option>
        </NativeSelect>
      </Field>
      <Field id="district" label="الحي" error={fe.district}>
        <Input name="district" required maxLength={80} placeholder="مثال: النرجس" defaultValue={v?.district} />
      </Field>
      <Field id="propertyType" label="نوع العقار" error={fe.propertyType}>
        <NativeSelect name="propertyType" defaultValue={v?.propertyType ?? "villa"}>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">نوع العمل</legend>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(WORK_TYPE_LABELS).map(([value, l]) => (
            <label
              key={value}
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-input bg-card px-3 text-center text-sm font-medium",
                "has-[:checked]:border-primary has-[:checked]:bg-[var(--green-tint)] has-[:checked]:text-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              )}
            >
              <input type="radio" name="workType" value={value} defaultChecked={value === (state.values?.workType ?? "renovation")} className="sr-only" />
              {l}
            </label>
          ))}
        </div>
        {fe.workType ? <p className="text-xs text-destructive">{fe.workType}</p> : null}
      </fieldset>

      <Field id="description" label="وصف إضافي" optional hint="أي تفاصيل تساعدنا: عدد أفراد الأسرة، أسلوب الطبخ، ملاحظات خاصة" error={fe.description} className="sm:col-span-2">
        <Textarea name="description" rows={4} maxLength={2000} defaultValue={v?.description} />
      </Field>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive sm:col-span-2">
          {state.error}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
          حفظ والمتابعة
        </Button>
      </div>
    </form>
  );
}
