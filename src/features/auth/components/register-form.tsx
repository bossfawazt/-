"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/shared/phone-input";
import { useRegisterMutation } from "@/features/auth/hooks";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { RoleChoice } from "./role-choice";

/** docs/UIUX-touq.md #C.12 screen 2: phone, name, business name, terms checkbox. */
export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "+966",
      organizationType: "MERCHANT",
      businessNameAr: "",
      agreeToTerms: false as unknown as true,
    },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await registerMutation.mutateAsync(values);
      const params = new URLSearchParams({ phone: values.phone, purpose: "REGISTER" });
      router.push(`/verify-otp?${params.toString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إكمال التسجيل");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="organizationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الحساب</FormLabel>
              <FormControl>
                <RoleChoice value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="مثال: سارة العتيبي" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessNameAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المنشأة</FormLabel>
              <FormControl>
                <Input placeholder="مثال: بوتيك سارة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                </FormControl>
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  أوافق على{" "}
                  <a href="/legal/terms" className="text-primary underline underline-offset-2">
                    الشروط والأحكام
                  </a>{" "}
                  و
                  <a href="/legal/privacy" className="text-primary underline underline-offset-2">
                    سياسة الخصوصية
                  </a>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" loading={registerMutation.isPending}>
          متابعة
        </Button>
      </form>
    </Form>
  );
}
