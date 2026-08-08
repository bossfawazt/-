"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/shared/phone-input";
import { useSendOtpMutation } from "@/features/auth/hooks";
import { passwordLoginSchema, saudiPhoneSchema, type PasswordLoginInput } from "@/lib/validations/auth";

/** docs/UIUX-touq.md #C.12 screen 6: password login with an OTP-login toggle. */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const sendOtp = useSendOtpMutation();
  const [mode, setMode] = React.useState<"password" | "otp">("password");

  const form = useForm<PasswordLoginInput>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { phone: "+966", password: "" },
  });

  async function onSubmitPassword(values: PasswordLoginInput) {
    const result = await signIn("password", { ...values, redirect: false });
    if (result?.error) {
      toast.error("رقم الجوال أو كلمة المرور غير صحيحة");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function onRequestOtpLogin() {
    const phone = form.getValues("phone");
    const parsed = saudiPhoneSchema.safeParse(phone);
    if (!parsed.success) {
      form.setError("phone", { message: parsed.error.issues[0]?.message });
      return;
    }
    try {
      await sendOtp.mutateAsync({ phone, purpose: "LOGIN" });
      const params = new URLSearchParams({ phone, purpose: "LOGIN", callbackUrl });
      router.push(`/verify-otp?${params.toString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال رمز التحقق");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitPassword)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الجوال</FormLabel>
              <FormControl>
                <PhoneInput value={field.value} onChange={field.onChange} invalid={!!form.formState.errors.phone} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "password" ? (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>كلمة المرور</FormLabel>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
              تسجيل الدخول
            </Button>
          </>
        ) : (
          <Button type="button" size="lg" loading={sendOtp.isPending} onClick={onRequestOtpLogin}>
            إرسال رمز التحقق
          </Button>
        )}

        <button
          type="button"
          onClick={() => setMode((m) => (m === "password" ? "otp" : "password"))}
          className="text-sm font-medium text-primary hover:underline"
        >
          {mode === "password" ? "تسجيل الدخول عبر رمز التحقق" : "تسجيل الدخول بكلمة المرور"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            سجّل الآن
          </Link>
        </p>
      </form>
    </Form>
  );
}
