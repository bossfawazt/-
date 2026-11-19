import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { PROJECT_STATUS_LABELS, WIZARD_STEPS } from "@/features/projects/labels";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { formatSaudiMobile } from "@/lib/validation/phone";
import { BACKOFFICE_ROLES, ROLE_LABELS } from "@/types/roles";

export const metadata: Metadata = { title: "حسابي" };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { error } = await searchParams;
  const profile = await requireUser("/account");
  if (!profile.hasConsent) redirect("/account/complete-profile");

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, district, status, current_step, updated_at")
    .eq("customer_id", profile.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return (
    <div className="container-page py-8 sm:py-12">
      {error === "forbidden" ? (
        <p role="alert" className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          لا تملك صلاحية الوصول إلى الصفحة المطلوبة.
        </p>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{ROLE_LABELS[profile.role]}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">أهلاً {profile.fullName ?? ""}</h1>
          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
            {formatSaudiMobile(profile.phone)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BACKOFFICE_ROLES.includes(profile.role) ? (
            <Button asChild variant="secondary" size="sm" className="h-10 border-border">
              <Link href="/admin">لوحة الإدارة</Link>
            </Button>
          ) : null}
          <SignOutButton />
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">مشاريعي</h2>
          <Button asChild size="sm" className="h-10">
            <Link href="/design">
              <Plus aria-hidden />
              مشروع جديد
            </Link>
          </Button>
        </div>

        {projects && projects.length > 0 ? (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {projects.map((p) => {
              const step = Math.min(p.current_step, WIZARD_STEPS.length);
              return (
                <li key={p.id}>
                  <Link
                    href={`/account/projects/${p.id}`}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">الرياض — {p.district}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs">{PROJECT_STATUS_LABELS[p.status]}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${((step - 1) / WIZARD_STEPS.length) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>الخطوة التالية: {WIZARD_STEPS[step - 1]}</span>
                      <span>آخر تحديث {formatDate(p.updated_at)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--input)] bg-card px-6 py-12 text-center">
            <FolderOpen className="size-10 text-stone" aria-hidden />
            <p className="font-semibold">لا توجد مشاريع بعد</p>
            <p className="max-w-sm text-sm text-muted-foreground">ابدأ مشروعك الأول، وسيُحفظ هنا لتكمله متى شئت.</p>
            <Button asChild size="lg">
              <Link href="/design">
                ابدأ تصميم مطبخك
                <ArrowLeft aria-hidden />
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
