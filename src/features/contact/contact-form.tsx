"use client";

import { useActionState } from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { submitContact, type ContactFormState } from "./actions";

const topics = [
  { value: "general", label: "استفسار عام" },
  { value: "partnership", label: "شراكة مصنع" },
  { value: "support", label: "دعم طلب قائم" },
  { value: "other", label: "أخرى" },
] as const;

export function ContactForm({ defaultTopic = "general" }: { defaultTopic?: string }) {
  const [state, action, pending] = useActionState<ContactFormState, FormData>(submitContact, { status: "idle" });
  const fe = state.fieldErrors ?? {};
  const v = state.values;

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <CircleCheck className="size-10 text-success" aria-hidden />
        <p className="text-lg font-semibold">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-8" noValidate>
      <Field id="fullName" label="الاسم" error={fe.fullName}>
        <Input name="fullName" autoComplete="name" required maxLength={120} defaultValue={v?.fullName} />
      </Field>
      <Field id="phone" label="رقم الجوال" error={fe.phone}>
        <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="05XXXXXXXX" dir="ltr" className="text-end" required defaultValue={v?.phone} />
      </Field>
      <Field id="email" label="البريد الإلكتروني" optional error={fe.email}>
        <Input name="email" type="email" autoComplete="email" dir="ltr" className="text-end" defaultValue={v?.email} />
      </Field>
      <Field id="topic" label="الموضوع" error={fe.topic}>
        <NativeSelect name="topic" defaultValue={v?.topic ?? (topics.some((t) => t.value === defaultTopic) ? defaultTopic : "general")}>
          {topics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field id="message" label="رسالتك" error={fe.message} className="sm:col-span-2">
        <Textarea name="message" rows={5} required maxLength={2000} defaultValue={v?.message} />
      </Field>
      {/* مصيدة الروبوتات: مخفية عن المستخدمين */}
      <div aria-hidden className="absolute -start-[9999px] h-0 overflow-hidden">
        <label>
          الموقع
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground sm:col-span-2">
        نستخدم بياناتك للرد على رسالتك فقط وفق سياسة الخصوصية.
      </p>
      <Button type="submit" size="lg" loading={pending} className="sm:col-span-2 sm:justify-self-start">
        إرسال الرسالة
      </Button>
    </form>
  );
}
