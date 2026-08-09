"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketingKitMutation, type MarketingKitData } from "@/features/ai/hooks";

interface MarketingKitPanelProps {
  productId: string;
}

const FIELDS: { key: keyof MarketingKitData; label: string; multiline?: boolean }[] = [
  { key: "shortDescriptionAr", label: "وصف قصير" },
  { key: "longDescriptionAr", label: "وصف طويل", multiline: true },
  { key: "instagramCaption", label: "منشور إنستغرام", multiline: true },
  { key: "tiktokCaption", label: "منشور تيك توك", multiline: true },
  { key: "whatsappMessage", label: "رسالة واتساب", multiline: true },
  { key: "seoTitle", label: "عنوان SEO" },
  { key: "seoDescription", label: "وصف SEO", multiline: true },
];

function CopyRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    toast.success("تم النسخ");
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <Button type="button" variant="icon" size="icon" className="size-7" onClick={copy} aria-label={`نسخ ${label}`}>
          <Copy className="size-3.5" />
        </Button>
      </div>
      <p className={multiline ? "whitespace-pre-line text-sm text-foreground" : "text-sm text-foreground"}>{value}</p>
    </div>
  );
}

/** New: AI Marketing Kit — per-product generated captions/SEO copy, editable-by-copy (fields aren't saved anywhere, the supplier pastes what they need). */
export function MarketingKitPanel({ productId }: MarketingKitPanelProps) {
  const generate = useMarketingKitMutation();
  const [kit, setKit] = React.useState<MarketingKitData | null>(null);

  async function handleGenerate() {
    try {
      const result = await generate.mutateAsync(productId);
      setKit(result.kit);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إنشاء الحزمة التسويقية");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          حزمة تسويقية بالذكاء الاصطناعي <Badge variant="gold">Mock AI</Badge>
        </CardTitle>
        <Button type="button" size="sm" onClick={handleGenerate} loading={generate.isPending}>
          <Sparkles className="size-4" /> {kit ? "إعادة الإنشاء" : "إنشاء حزمة تسويقية"}
        </Button>
      </CardHeader>
      {kit ? (
        <CardContent className="flex flex-col gap-3">
          {FIELDS.map((f) => (
            <CopyRow key={f.key} label={f.label} value={kit[f.key] as string} multiline={f.multiline} />
          ))}
          <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
            <span className="text-xs font-semibold text-muted-foreground">الوسوم</span>
            <div className="flex flex-wrap gap-1.5">
              {kit.hashtags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            أنشئ وصفًا قصيرًا وطويلًا، منشورات إنستغرام وتيك توك وواتساب، وسومًا، وعنوان/وصف SEO لهذا المنتج بضغطة واحدة.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
