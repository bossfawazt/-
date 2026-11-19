import type { Metadata } from "next";
import { SetupNotice } from "@/components/feedback/setup-notice";
import { NewProjectForm } from "@/features/projects/new-project-form";
import { WizardSteps } from "@/features/projects/wizard-steps";
import { requireUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "صمم مطبخك" };

export default async function DesignPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page max-w-2xl py-12">
        <h1 className="text-2xl font-bold">صمم مطبخك</h1>
        <div className="mt-6">
          <SetupNotice title="الخدمة تحتاج إلى إعداد قاعدة البيانات">
            لحفظ المشاريع وتسجيل الدخول يلزم ربط المنصة بـ Supabase. راجع README.
          </SetupNotice>
        </div>
      </div>
    );
  }
  const profile = await requireUser("/design");
  if (!profile.hasConsent) redirect("/account/complete-profile?next=/design");

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <WizardSteps current={1} />
      <div className="mt-8">
        <p className="eyebrow">مشروع جديد</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">معلومات المشروع</h1>
        <p className="mt-2 text-muted-foreground">يُحفظ مشروعك تلقائياً ويمكنك إكماله في أي وقت من حسابك.</p>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-8">
        <NewProjectForm />
      </div>
    </div>
  );
}
