"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategoriesQuery } from "@/features/marketplace/hooks";
import { useCreateProductMutation, useUpdateProductMutation } from "@/features/catalog/hooks";
import { useAnalyzeProductImageMutation } from "@/features/ai/hooks";
import { MediaField } from "@/features/catalog/components/media-field";
import { VariantField } from "@/features/catalog/components/variant-field";
import { productFormSchema, type ProductFormInput } from "@/lib/validations/product";

const ATTRIBUTE_ORDER = ["fabric", "style", "sleeve", "color", "embroidery", "category", "season"] as const;

const EMPTY_VARIANT: ProductFormInput["variants"][number] = {
  color: "",
  size: "",
  moq: 10,
  leadTimeDays: 7,
  stockStatus: "IN_STOCK",
  pricingTiers: [{ minQty: 10, maxQty: null, unitPriceSar: 0 }],
};

interface ProductFormProps {
  productId?: string;
  defaultValues?: Partial<ProductFormInput>;
}

/** docs/UIUX-touq.md #C.8: create/edit product form. AI Product Creator (docs/AI-SYSTEM-touq.md #3.1, Phase 13) analyzes the primary image and prefills fields below via setValue — nothing saves until the supplier reviews and submits normally. */
export function ProductForm({ productId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const { data: attributeDefs, isLoading: attributesLoading } = useCategoriesQuery();
  const createProduct = useCreateProductMutation();
  // Hooks must run unconditionally — pass a placeholder id when creating,
  // since updateProduct.mutateAsync is simply never called in that branch.
  const updateProduct = useUpdateProductMutation(productId ?? "");
  const isEdit = !!productId;

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      attributes: { fabric: "", style: "", sleeve: "", color: "", embroidery: "", category: "", season: "" },
      media: [],
      variants: [EMPTY_VARIANT],
      ...defaultValues,
    },
  });

  const variantsArray = useFieldArray({ control: form.control, name: "variants" });
  const analyzeImage = useAnalyzeProductImageMutation();
  const media = useWatch({ control: form.control, name: "media" });
  const primaryImage = media.find((m) => m.isPrimary) ?? media[0];

  async function handleAnalyze() {
    if (!primaryImage) return;
    try {
      const { suggestion } = await analyzeImage.mutateAsync(primaryImage.url);
      form.setValue("titleAr", suggestion.titleAr, { shouldDirty: true });
      form.setValue("titleEn", suggestion.titleEn, { shouldDirty: true });
      form.setValue("descriptionAr", suggestion.descriptionAr, { shouldDirty: true });
      for (const [key, value] of Object.entries(suggestion.attributes)) {
        form.setValue(`attributes.${key as keyof ProductFormInput["attributes"]}`, value, { shouldDirty: true });
      }
      toast.success(`تم إنشاء اقتراح بدقة تقديرية ${Math.round(suggestion.confidence * 100)}% — راجعه وعدّله قبل الحفظ`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحليل الصورة");
    }
  }

  async function onSubmit(values: ProductFormInput) {
    try {
      if (isEdit) {
        await updateProduct.mutateAsync(values);
        toast.success("تم حفظ التعديلات");
      } else {
        await createProduct.mutateAsync(values);
        toast.success("تم إنشاء المنتج كمسودة");
      }
      router.push("/supplier/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ المنتج");
    }
  }

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="titleAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المنتج (عربي)</FormLabel>
              <FormControl>
                <Input placeholder="عباية ندى كلاسيكية مطرزة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titleEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المنتج (إنجليزي) — اختياري</FormLabel>
              <FormControl>
                <Input dir="ltr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف — اختياري</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">مواصفات المنتج</h2>
          {attributesLoading ? (
            <p className="text-sm text-muted-foreground">جارٍ تحميل القوائم...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {ATTRIBUTE_ORDER.map((attrKey) => {
                const definition = attributeDefs?.find((a) => a.key === attrKey);
                if (!definition) return null;
                return (
                  <FormField
                    key={attrKey}
                    control={form.control}
                    name={`attributes.${attrKey}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{definition.labelAr}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {definition.options.map((option) => (
                              <SelectItem key={option.key} value={option.key}>
                                {option.valueAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>

        <MediaField />

        {primaryImage ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
            <Sparkles className="size-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">تحليل المنتج بالذكاء الاصطناعي</p>
              <p className="text-xs text-muted-foreground">
                يقترح النظام العنوان والوصف والمواصفات من الصورة الرئيسية — قابلة للتعديل الكامل قبل الحفظ.{" "}
                <Badge variant="gold" className="align-middle">Mock AI</Badge>
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleAnalyze} loading={analyzeImage.isPending}>
              <Sparkles className="size-4" /> تحليل بالذكاء الاصطناعي
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">المتغيرات والأسعار</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => variantsArray.append(EMPTY_VARIANT)}>
              <Plus className="size-4" /> إضافة متغير
            </Button>
          </div>
          {variantsArray.fields.map((field, index) => (
            <VariantField
              key={field.id}
              variantIndex={index}
              canRemove={variantsArray.fields.length > 1}
              onRemove={() => variantsArray.remove(index)}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "حفظ التعديلات" : "حفظ كمسودة"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
