"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/shared/status-pill";
import {
  useCreateQuoteMutation,
  useQuoteActionMutation,
  useRfqQuery,
  useSendMessageMutation,
} from "@/features/rfq/hooks";
import { formatMoney, formatRelativeTime } from "@/lib/format";
import { QUOTE_STATUS_META, RFQ_STATUS_META } from "@/lib/status-labels";
import { cn } from "@/lib/utils";
import { createQuoteSchema, type CreateQuoteInput } from "@/lib/validations/rfq";

const QUOTABLE_STATUSES = ["SUBMITTED", "VIEWED", "QUOTED", "NEGOTIATING"];

export function RfqDetail({ rfqId }: { rfqId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: rfq, isLoading } = useRfqQuery(rfqId);
  const sendMessage = useSendMessageMutation(rfqId);
  const createQuote = useCreateQuoteMutation(rfqId);
  const quoteAction = useQuoteActionMutation(rfqId);
  const [messageText, setMessageText] = React.useState("");

  const isSupplier = session?.user.organization?.type === "SUPPLIER";
  const basePath = isSupplier ? "/supplier/rfqs" : "/merchant/requests";

  const quoteForm = useForm<CreateQuoteInput>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: { quotedQty: 0, quotedUnitPriceSar: 0, leadTimeDays: 7, validForDays: 7 },
  });

  if (isLoading || !rfq) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const meta = RFQ_STATUS_META[rfq.status as keyof typeof RFQ_STATUS_META];
  const pendingQuote = rfq.quotes.find((q) => q.status === "PENDING");

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await sendMessage.mutateAsync(messageText);
      setMessageText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال الرسالة");
    }
  }

  async function handleCreateQuote(values: CreateQuoteInput) {
    try {
      await createQuote.mutateAsync(values);
      toast.success("تم إرسال عرض السعر");
      quoteForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال العرض");
    }
  }

  async function handleQuoteAction(quoteId: string, action: "accept" | "decline") {
    try {
      const result = await quoteAction.mutateAsync({ quoteId, action });
      if (action === "accept") {
        toast.success("تم قبول العرض وإنشاء الطلب");
        router.push(`/merchant/orders/${result.id}`);
      } else {
        toast.success("تم رفض العرض");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تنفيذ الإجراء");
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {isSupplier ? rfq.merchant.legalNameAr : rfq.supplier.legalNameAr}
          </h1>
          <p className="text-sm text-muted-foreground">{rfq.product?.titleAr ?? "طلب عام"}</p>
        </div>
        <StatusPill labelAr={meta.labelAr} variant={meta.variant} />
      </div>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-3">
          <div>
            <span className="block text-muted-foreground">الكمية المطلوبة</span>
            <span className="font-semibold text-foreground">{rfq.requestedQty}</span>
          </div>
          {rfq.targetPriceMinor ? (
            <div>
              <span className="block text-muted-foreground">السعر المستهدف</span>
              <span className="font-semibold text-foreground">{formatMoney(rfq.targetPriceMinor)}</span>
            </div>
          ) : null}
          {rfq.customizationNotes ? (
            <div className="col-span-2 sm:col-span-3">
              <span className="block text-muted-foreground">ملاحظات</span>
              <span className="text-foreground">{rfq.customizationNotes}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {rfq.quotes.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>عروض الأسعار</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {rfq.quotes.map((quote) => {
              const qMeta = QUOTE_STATUS_META[quote.status as keyof typeof QUOTE_STATUS_META];
              return (
                <div key={quote.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {quote.quotedQty} × {formatMoney(quote.quotedUnitPriceMinor)} = {formatMoney(quote.quotedQty * quote.quotedUnitPriceMinor)}
                    </span>
                    <span className="text-muted-foreground">مدة التوريد: {quote.leadTimeDays} أيام</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill labelAr={qMeta.labelAr} variant={qMeta.variant} />
                    {!isSupplier && quote.status === "PENDING" ? (
                      <>
                        <Button size="sm" onClick={() => handleQuoteAction(quote.id, "accept")} loading={quoteAction.isPending}>
                          قبول العرض
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleQuoteAction(quote.id, "decline")}
                          disabled={quoteAction.isPending}
                        >
                          رفض
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {isSupplier && QUOTABLE_STATUSES.includes(rfq.status) && !pendingQuote ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إرسال عرض سعر</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...quoteForm}>
              <form onSubmit={quoteForm.handleSubmit(handleCreateQuote)} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <FormField
                  control={quoteForm.control}
                  name="quotedQty"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>الكمية</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} value={value || ""} onChange={(e) => onChange(e.target.valueAsNumber)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={quoteForm.control}
                  name="quotedUnitPriceSar"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>سعر الوحدة (ر.س)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" value={value || ""} onChange={(e) => onChange(e.target.valueAsNumber)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={quoteForm.control}
                  name="leadTimeDays"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>مدة التوريد (أيام)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} value={value || ""} onChange={(e) => onChange(e.target.valueAsNumber)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={quoteForm.control}
                  name="validForDays"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>صلاحية العرض (أيام)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} value={value || ""} onChange={(e) => onChange(e.target.valueAsNumber)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="col-span-2 sm:col-span-4" loading={createQuote.isPending}>
                  إرسال العرض
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>المحادثة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
            {rfq.messages.map((message) => {
              const isMine = message.sender.id === session?.user.id;
              return (
                <div key={message.id} className={cn("flex flex-col gap-0.5", isMine ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      isMine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                    )}
                  >
                    {message.body}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {message.sender.name} · {formatRelativeTime(message.createdAt)}
                  </span>
                </div>
              );
            })}
            {!rfq.messages.length ? <p className="text-sm text-muted-foreground">لا توجد رسائل بعد</p> : null}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="اكتب رسالة..."
              className="flex-1"
            />
            <Button type="submit" size="icon" loading={sendMessage.isPending} aria-label="إرسال">
              <Send className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <button type="button" onClick={() => router.push(basePath)} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
        العودة للقائمة
      </button>
    </div>
  );
}
