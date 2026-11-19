"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { completeProfile, type ProfileFormState } from "./actions";

export function CompleteProfileForm({ next, defaultName, defaultEmail }: { next: string; defaultName: string; defaultEmail: string }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(completeProfile, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values;
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field id="fullName" label="الاسم" error={fe.fullName}>
        <Input name="fullName" autoComplete="name" defaultValue={v?.fullName ?? defaultName} required maxLength={120} />
      </Field>
      <Field id="email" label="البريد الإلكتروني" optional error={fe.email}>
        <Input name="email" type="email" autoComplete="email" dir="ltr" className="text-end" defaultValue={v?.email ?? defaultEmail} />
      </Field>

      <fieldset className="flex flex-col gap-3 rounded-xl bg-secondary p-4">
        <legend className="sr-only">الموافقات</legend>
        <label className="flex gap-3 text-sm leading-6">
          <input type="checkbox" name="consent" className="mt-1 size-5 shrink-0 accent-[var(--green)]" required aria-invalid={fe.consent ? true : undefined} />
          <span>
            أوافق على معالجة بياناتي وصور مطبخي لغرض تقديم الخدمة: توليد التصورات بالذكاء الاصطناعي، وحساب السعر، وتنسيق
            المعاينة مع الفني والمصنع، وذلك عبر مزودي الخدمات الموضحين في{" "}
            <Link href="/legal/privacy" target="_blank" className="text-primary underline underline-offset-4">
              سياسة الخصوصية
            </Link>
            .
          </span>
        </label>
        {fe.consent ? <p className="text-xs font-medium text-destructive">{fe.consent}</p> : null}
        <label className="flex gap-3 text-sm leading-6 text-muted-foreground">
          <input type="checkbox" name="marketingConsent" defaultChecked={v?.marketingConsent === "on"} className="mt-1 size-5 shrink-0 accent-[var(--green)]" />
          <span>(اختياري) أرغب في استلام العروض والأخبار. يمكنني إلغاء ذلك في أي وقت.</span>
        </label>
        <p className="text-xs text-muted-foreground">لن تُستخدم صورك في تدريب النماذج أو التسويق دون موافقة مستقلة منك.</p>
      </fieldset>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={pending}>
        حفظ ومتابعة
      </Button>
    </form>
  );
}
