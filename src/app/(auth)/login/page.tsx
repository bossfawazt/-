import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/feedback/setup-notice";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/features/auth/login-form";
import { devLogin } from "@/features/auth/actions";
import { getCurrentProfile } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { isDevLoginEnabled } from "@/lib/env.server";
import { safeNextPath } from "@/lib/validation/schemas";
import { APP_ROLES, homePathForRole, ROLE_LABELS } from "@/types/roles";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const profile = await getCurrentProfile();
  if (profile) redirect(next || homePathForRole(profile.role));

  const configured = isSupabaseConfigured();
  const devLoginEnabled = configured && isDevLoginEnabled();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">تسجيل الدخول</h1>
        <p className="mt-2 text-muted-foreground">ادخل برقم جوالك لحفظ مشاريعك ومتابعة طلباتك. لا حاجة لكلمة مرور.</p>
      </div>

      {params.error === "inactive" ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          هذا الحساب موقوف. تواصل مع الدعم.
        </p>
      ) : null}

      {configured ? (
        <LoginForm next={next} />
      ) : (
        <SetupNotice title="خدمة الدخول غير مفعلة بعد">
          يلزم ربط المشروع بـ Supabase وتفعيل الدخول برقم الجوال ومزود الرسائل. راجع قسم «إعداد Supabase» في README.
        </SetupNotice>
      )}

      <p className="text-xs leading-6 text-muted-foreground">
        بالمتابعة فإنك توافق على{" "}
        <Link href="/legal/terms" className="text-primary underline-offset-4 hover:underline">
          شروط الاستخدام
        </Link>{" "}
        وتقر بالاطلاع على{" "}
        <Link href="/legal/privacy" className="text-primary underline-offset-4 hover:underline">
          سياسة الخصوصية
        </Link>
        .
      </p>

      {devLoginEnabled ? (
        <section className="rounded-xl border border-dashed border-warning/50 bg-warning/5 p-4">
          <h2 className="text-sm font-semibold">دخول الاختبار (بيئة التطوير فقط)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            يظهر فقط عند ENABLE_DEV_LOGIN=true خارج الإنتاج. ينشئ حساب اختبار بالدور المختار.
          </p>
          <form action={devLogin} className="mt-3 grid grid-cols-2 gap-2">
            {APP_ROLES.map((role) => (
              <Button key={role} type="submit" name="role" value={role} variant="secondary" size="sm" className="border-border">
                {ROLE_LABELS[role]}
              </Button>
            ))}
          </form>
        </section>
      ) : null}
    </div>
  );
}
