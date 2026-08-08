"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { useRegionsQuery, useUpdateOrganizationMutation } from "@/features/auth/hooks";
import { useOrganizationQuery } from "@/features/settings/hooks";
import { businessDetailsSchema, type BusinessDetailsInput } from "@/lib/validations/auth";

interface OrganizationTabProps {
  organizationId: string;
}

/** docs/UIUX-touq.md #C.13: Settings > Organization — CR/Maroof become read-only once verified. */
export function OrganizationTab({ organizationId }: OrganizationTabProps) {
  const { data: organization, isLoading } = useOrganizationQuery(organizationId);
  const { data: regions, isLoading: regionsLoading } = useRegionsQuery();
  const updateOrganization = useUpdateOrganizationMutation(organizationId);

  const form = useForm<BusinessDetailsInput>({
    resolver: zodResolver(businessDetailsSchema),
    values: organization
      ? {
          legalNameAr: organization.legalNameAr,
          legalNameEn: organization.legalNameEn ?? "",
          crNumber: organization.crNumber ?? "",
          maroofId: organization.maroofId ?? "",
          regionId: organization.regionId ?? "",
          city: organization.city ?? "",
          descriptionAr: organization.descriptionAr ?? "",
        }
      : undefined,
    defaultValues: { legalNameAr: "", legalNameEn: "", crNumber: "", maroofId: "", regionId: "", city: "", descriptionAr: "" },
  });

  async function onSubmit(values: BusinessDetailsInput) {
    try {
      await updateOrganization.mutateAsync(values);
      toast.success("تم حفظ بيانات المنشأة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ البيانات");
    }
  }

  if (isLoading || !organization) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isVerified = organization.verificationStatus === "VERIFIED";

  return (
    <Card>
      <CardHeader>
        <CardTitle>بيانات المنشأة</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="legalNameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المنشأة (عربي)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legalNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المنشأة (إنجليزي) — اختياري</FormLabel>
                  <FormControl>
                    <Input dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="crNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      رقم السجل التجاري
                      {isVerified ? <VerifiedBadge compact /> : null}
                    </FormLabel>
                    <FormControl>
                      <Input dir="ltr" disabled={isVerified} {...field} />
                    </FormControl>
                    {isVerified ? (
                      <FormDescription>للتعديل بعد التوثيق، تواصل مع الدعم.</FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maroofId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم معروف — اختياري</FormLabel>
                    <FormControl>
                      <Input dir="ltr" disabled={isVerified} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المنطقة/المدينة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={regionsLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions?.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحي / العنوان المختصر</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نبذة عن المنشأة — اختياري</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-fit" loading={updateOrganization.isPending}>
              حفظ التغييرات
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
