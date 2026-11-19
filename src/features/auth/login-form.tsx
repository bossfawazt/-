"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatSaudiMobile } from "@/lib/validation/phone";
import { authStep, type AuthFormState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(authStep, { step: "phone" });

  if (state.step === "otp" && state.phone) {
    return (
      <form action={action} className="flex flex-col gap-5" key="otp">
        <input type="hidden" name="intent" value="verify" />
        <input type="hidden" name="phone" value={state.phone} />
        <input type="hidden" name="next" value={next} />
        <p className="text-sm text-muted-foreground">
          {state.info ?? "أدخل رمز التحقق"}{" "}
          <span dir="ltr" className="font-medium text-foreground">
            {formatSaudiMobile(state.phone)}
          </span>
        </p>
        <Field id="token" label="رمز التحقق" error={state.error}>
          <Input
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9٠-٩]{6}"
            maxLength={6}
            dir="ltr"
            autoFocus
            className="h-14 text-center text-2xl tracking-[0.5em]"
            required
          />
        </Field>
        <Button type="submit" size="lg" loading={pending}>
          تأكيد الدخول
        </Button>
        <button
          type="submit"
          formNoValidate
          name="intent"
          value="request"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          إعادة إرسال الرمز
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" key="phone">
      <input type="hidden" name="intent" value="request" />
      <input type="hidden" name="next" value={next} />
      <Field id="phone" label="رقم الجوال" hint="سنرسل لك رمز تحقق برسالة نصية" error={state.error}>
        <Input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="05XXXXXXXX"
          dir="ltr"
          defaultValue={state.rawPhone ?? (state.phone ? formatSaudiMobile(state.phone) : undefined)}
          className="text-end text-lg"
          required
        />
      </Field>
      <Button type="submit" size="lg" loading={pending}>
        إرسال رمز التحقق
      </Button>
    </form>
  );
}
