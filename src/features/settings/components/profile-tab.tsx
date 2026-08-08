"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { useProfileQuery, useUpdateProfileMutation } from "@/features/settings/hooks";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/settings";

/** docs/UIUX-touq.md #C.13: Settings > Profile — name, phone (read-only + verified badge), email. */
export function ProfileTab() {
  const { data: profile, isLoading } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: profile ? { name: profile.name, email: profile.email ?? "" } : undefined,
    defaultValues: { name: "", email: "" },
  });

  async function onSubmit(values: UpdateProfileInput) {
    try {
      await updateProfile.mutateAsync(values);
      toast.success("تم حفظ التغييرات");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ التغييرات");
    }
  }

  if (isLoading || !profile) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>الملف الشخصي</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">رقم الجوال</label>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                <span dir="ltr" className="text-sm text-foreground">{profile.phone}</span>
                {profile.phoneVerifiedAt ? <VerifiedBadge compact /> : null}
              </div>
              <p className="text-xs text-muted-foreground">لتغيير رقم الجوال، تواصل مع الدعم لإعادة التحقق.</p>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني — اختياري</FormLabel>
                  <FormControl>
                    <Input dir="ltr" type="email" {...field} />
                  </FormControl>
                  <FormDescription>يُستخدم لإشعارات البريد الإلكتروني عند تفعيلها.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-fit" loading={updateProfile.isPending}>
              حفظ التغييرات
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
