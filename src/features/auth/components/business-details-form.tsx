"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCheck2, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRegionsQuery, useUpdateOrganizationMutation } from "@/features/auth/hooks";
import { businessDetailsSchema, type BusinessDetailsInput } from "@/lib/validations/auth";
import { useUploadThing } from "@/lib/uploadthing";

interface BusinessDetailsFormProps {
  organizationId: string;
  organizationType: "SUPPLIER" | "MERCHANT";
}

/** docs/UIUX-touq.md #C.12 screen 4: business details + CR/Maroof document upload. */
export function BusinessDetailsForm({ organizationId, organizationType }: BusinessDetailsFormProps) {
  const router = useRouter();
  const { data: regions, isLoading: regionsLoading } = useRegionsQuery();
  const updateOrganization = useUpdateOrganizationMutation(organizationId);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);

  const { startUpload, isUploading } = useUploadThing("verificationDocument", {
    onClientUploadComplete: (files) => {
      setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)]);
      toast.success("تم رفع المستند بنجاح");
    },
    onUploadError: (error) => {
      toast.error(`تعذر رفع المستند: ${error.message}`);
    },
  });

  const form = useForm<BusinessDetailsInput>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      legalNameAr: "",
      legalNameEn: "",
      crNumber: "",
      maroofId: "",
      regionId: "",
      city: "",
      descriptionAr: "",
    },
  });

  async function onSubmit(values: BusinessDetailsInput) {
    try {
      await updateOrganization.mutateAsync(values);
      router.push(organizationType === "SUPPLIER" ? "/supplier" : "/merchant");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ البيانات");
    }
  }

  return (
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
                <FormLabel>رقم السجل التجاري</FormLabel>
                <FormControl>
                  <Input dir="ltr" {...field} />
                </FormControl>
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
                  <Input dir="ltr" {...field} />
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

        <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-4">
          <FormLabel>مستندات السجل التجاري</FormLabel>
          <FormDescription>
            ارفع صورة أو ملف PDF للسجل التجاري لتسريع مراجعة التوثيق.
          </FormDescription>
          <input
            type="file"
            accept="application/pdf,image/*"
            multiple
            className="hidden"
            id="cr-upload"
            onChange={(event) => {
              const files = event.target.files ? Array.from(event.target.files) : [];
              if (files.length) startUpload(files);
            }}
          />
          <label htmlFor="cr-upload">
            <Button type="button" variant="secondary" size="sm" asChild disabled={isUploading}>
              <span className="cursor-pointer">
                {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                رفع المستندات
              </span>
            </Button>
          </label>
          {uploadedFiles.map((name) => (
            <span key={name} className="flex items-center gap-1.5 text-xs text-success">
              <FileCheck2 className="size-3.5" /> {name}
            </span>
          ))}
        </div>

        <Button type="submit" size="lg" loading={updateOrganization.isPending}>
          إرسال للمراجعة
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          سيتم مراجعة طلبك خلال 1-2 يوم عمل. يمكنك تصفح المنصة بصلاحيات محدودة حتى اكتمال التوثيق.
        </p>
      </form>
    </Form>
  );
}
