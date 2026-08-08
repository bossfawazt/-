"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ProductFormInput } from "@/lib/validations/product";

const STOCK_STATUS_OPTIONS = [
  { value: "IN_STOCK", label: "متوفر" },
  { value: "MADE_TO_ORDER", label: "حسب الطلب" },
  { value: "OUT_OF_STOCK", label: "غير متوفر" },
];

interface VariantFieldProps {
  variantIndex: number;
  onRemove: () => void;
  canRemove: boolean;
}

/** docs/UIUX-touq.md #C.8: one variant (color/size/MOQ/lead time/stock) with its own tiered-pricing builder. */
export function VariantField({ variantIndex, onRemove, canRemove }: VariantFieldProps) {
  const { control } = useFormContext<ProductFormInput>();
  const tiersArray = useFieldArray({ control, name: `variants.${variantIndex}.pricingTiers` });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <h3 className="text-sm font-semibold">متغير #{variantIndex + 1}</h3>
        {canRemove ? (
          <Button type="button" variant="icon" size="icon" onClick={onRemove} aria-label="حذف المتغير">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FormField
            control={control}
            name={`variants.${variantIndex}.color`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>اللون</FormLabel>
                <FormControl>
                  <Input placeholder="أسود" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${variantIndex}.size`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>المقاس</FormLabel>
                <FormControl>
                  <Input placeholder="One Size" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${variantIndex}.moq`}
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>الحد الأدنى للطلب</FormLabel>
                <FormControl>
                  <Input type="number" min={1} value={value ?? ""} onChange={(e) => onChange(e.target.valueAsNumber)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${variantIndex}.leadTimeDays`}
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>مدة التوريد (أيام)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} value={value ?? ""} onChange={(e) => onChange(e.target.valueAsNumber)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name={`variants.${variantIndex}.stockStatus`}
          render={({ field }) => (
            <FormItem className="max-w-56">
              <FormLabel>حالة التوفر</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STOCK_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">أسعار الجملة حسب الكمية</span>
          {tiersArray.fields.map((tierField, tierIndex) => (
            <div key={tierField.id} className="flex items-end gap-2">
              <FormField
                control={control}
                name={`variants.${variantIndex}.pricingTiers.${tierIndex}.minQty`}
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="flex-1">
                    {tierIndex === 0 ? <FormLabel>من كمية</FormLabel> : null}
                    <FormControl>
                      <Input type="number" min={1} value={value ?? ""} onChange={(e) => onChange(e.target.valueAsNumber)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`variants.${variantIndex}.pricingTiers.${tierIndex}.maxQty`}
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="flex-1">
                    {tierIndex === 0 ? <FormLabel>إلى كمية (اختياري)</FormLabel> : null}
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value ? e.target.valueAsNumber : null)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`variants.${variantIndex}.pricingTiers.${tierIndex}.unitPriceSar`}
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="flex-1">
                    {tierIndex === 0 ? <FormLabel>سعر الوحدة (ر.س)</FormLabel> : null}
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.valueAsNumber)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {tiersArray.fields.length > 1 ? (
                <Button
                  type="button"
                  variant="icon"
                  size="icon"
                  onClick={() => tiersArray.remove(tierIndex)}
                  aria-label="حذف المستوى"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() => tiersArray.append({ minQty: 1, maxQty: null, unitPriceSar: 0 })}
          >
            <Plus className="size-4" /> إضافة مستوى سعر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
