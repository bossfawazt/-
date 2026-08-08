import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BusinessDetailsForm } from "@/features/auth/components/business-details-form";

export const metadata: Metadata = { title: "بيانات المنشأة" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user.organization) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">أكمل بيانات منشأتك</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          هذه المعلومات تساعدنا على توثيق حسابك وبناء الثقة مع{" "}
          {session.user.organization.type === "SUPPLIER" ? "التجار" : "الموردين"}
        </p>
      </div>
      <BusinessDetailsForm
        organizationId={session.user.organization.id}
        organizationType={session.user.organization.type}
      />
    </div>
  );
}
