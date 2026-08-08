"use client";

import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageTab } from "@/features/settings/components/language-tab";
import { NotificationsTab } from "@/features/settings/components/notifications-tab";
import { OrganizationTab } from "@/features/settings/components/organization-tab";
import { ProfileTab } from "@/features/settings/components/profile-tab";
import { SecurityTab } from "@/features/settings/components/security-tab";

/** docs/UIUX-touq.md #C.13: Settings shell — Team Members and Billing & Plan are Enterprise-tier/future, deferred. */
export function SettingsClient() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const organization = session?.user.organization;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">الإعدادات</h1>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          {organization ? <TabsTrigger value="organization">المنشأة</TabsTrigger> : null}
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="language">اللغة والمنطقة</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-6">
          <ProfileTab />
        </TabsContent>

        {organization ? (
          <TabsContent value="organization" className="pt-6">
            <OrganizationTab organizationId={organization.id} />
          </TabsContent>
        ) : null}

        <TabsContent value="security" className="pt-6">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="notifications" className="pt-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="language" className="pt-6">
          <LanguageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
