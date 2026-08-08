import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">إنشاء حساب جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">انضم إلى توق كمورد أو تاجر جملة</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        لديك حساب؟{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
