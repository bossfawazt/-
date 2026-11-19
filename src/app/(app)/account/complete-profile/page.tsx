import type { Metadata } from "next";
import { CompleteProfileForm } from "@/features/auth/complete-profile-form";
import { requireUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/validation/schemas";

export const metadata: Metadata = { title: "إكمال الملف الشخصي" };

export default async function CompleteProfilePage({ searchParams }: PageProps<"/account/complete-profile">) {
  const { next } = await searchParams;
  const profile = await requireUser("/account/complete-profile");
  return (
    <div className="container-page max-w-xl py-10 sm:py-14">
      <h1 className="text-2xl font-bold sm:text-3xl">أهلاً بك في معمار المنزل</h1>
      <p className="mt-2 text-muted-foreground">خطوة أخيرة قبل البدء: اسمك وموافقتك على معالجة البيانات.</p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-8">
        <CompleteProfileForm next={safeNextPath(next)} defaultName={profile.fullName ?? ""} defaultEmail={profile.email ?? ""} />
      </div>
    </div>
  );
}
