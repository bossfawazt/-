"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCreateRfqMutation } from "@/features/rfq/hooks";
import { createRfqSchema, type CreateRfqInput } from "@/lib/validations/rfq";

interface RfqBuilderFormProps {
  supplierId: string;
  supplierName: string;
  productId?: string;
  productTitle?: string;
  variantId?: string;
  variantLabel?: string;
  minQty: number;
}

/** docs/UIUX-touq.md #C.9 RFQ Builder — reached from Product Details' "Send Purchase Request" CTA. */
export function RfqBuilderForm({
  supplierId,
  supplierName,
  productId,
  productTitle,
  variantId,
  variantLabel,
  minQty,
}: RfqBuilderFormProps) {
  const router = useRouter();
  const createRfq = useCreateRfqMutation();

  const form = useForm<CreateRfqInput>({
    resolver: zodResolver(createRfqSchema),
    defaultValues: {
      supplierId,
      productId,
      variantId,
      requestedQty: minQty,
      customizationNotes: "",
    },
  });

  async function onSubmit(values: CreateRfqInput) {
    try {
      await createRfq.mutateAsync(values);
      toast.success("تم إرسال طلب الشراء");
      router.push("/merchant/requests");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال الطلب");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="rounded-md bg-secondary p-4 text-sm">
          <p>
            <strong className="font-semibold text-foreground">المورد:</strong> {supplierName}
          </p>
          {productTitle ? (
            <p>
              <strong className="font-semibold text-foreground">المنتج:</strong> {productTitle}
              {variantLabel ? ` (${variantLabel})` : ""}
            </p>
          ) : (
            <p className="text-muted-foreground">طلب عام — بدون منتج محدد</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="requestedQty"
          render={({ field: { onChange, value } }) => (
            <FormItem>
              <FormLabel>الكمية المطلوبة</FormLabel>
              <FormControl>
                <QuantityStepper value={value} onChange={onChange} min={minQty} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetPriceSar"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>السعر المستهدف للوحدة (ر.س) — اختياري</FormLabel>
              <FormControl>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value ?? ""}
                  onChange={(e) => onChange(e.target.value ? e.target.valueAsNumber : undefined)}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3.5 py-2 text-sm shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customizationNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات إضافية — اختياري</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="مثال: هل يمكن التوصيل خلال 10 أيام؟" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" loading={createRfq.isPending}>
          إرسال طلب الشراء
        </Button>
      </form>
    </Form>
  );
}
