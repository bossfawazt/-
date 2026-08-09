"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useImageStudioMutation, type ImageVariant } from "@/features/ai/hooks";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import type { ImageStudioMode } from "@/server/ai";

const MODES: ImageStudioMode[] = ["enhance", "remove_bg", "luxury_bg", "social_crop"];

/** CSS-only visual treatment per mode — an honest "mock preview" of the intended effect, never claiming real pixel processing happened (see AiHubClient banner). */
const MODE_STYLES: Record<ImageStudioMode, string> = {
  enhance: "brightness-110 contrast-110 saturate-125",
  remove_bg: "",
  luxury_bg: "",
  social_crop: "object-cover aspect-square",
};

function VariantPreview({ variant, sourceUrl }: { variant: ImageVariant; sourceUrl: string }) {
  const wrapperClass =
    variant.mode === "remove_bg"
      ? "bg-[linear-gradient(45deg,#e5e5e5_25%,transparent_25%),linear-gradient(-45deg,#e5e5e5_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e5e5_75%),linear-gradient(-45deg,transparent_75%,#e5e5e5_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]"
      : variant.mode === "luxury_bg"
        ? "bg-gradient-to-br from-primary/20 via-muted to-secondary"
        : "bg-muted";

  return (
    <Card>
      <div className={cn("relative aspect-square overflow-hidden", wrapperClass)}>
        <Image
          src={sourceUrl}
          alt={variant.labelAr}
          fill
          className={cn("object-contain p-3", MODE_STYLES[variant.mode])}
        />
      </div>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{variant.labelAr}</h3>
          <Badge variant="gold">Mock</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{variant.note}</p>
      </CardContent>
    </Card>
  );
}

/** New: AI Image Studio — Original vs 4 processed variants. Mock provider today (see provider note), architecture ready for a real image-AI API swap. */
export function ImageStudioClient() {
  const [sourceUrl, setSourceUrl] = React.useState<string | null>(null);
  const [variants, setVariants] = React.useState<ImageVariant[]>([]);
  const studio = useImageStudioMutation();

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: async (files) => {
      const url = files[0]?.ufsUrl ?? files[0]?.url;
      if (!url) return;
      setSourceUrl(url);
      setVariants([]);
      try {
        const result = await studio.mutateAsync({ imageUrl: url, modes: MODES });
        setVariants(result.variants);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذرت معالجة الصورة");
      }
    },
    onUploadError: (error) => {
      toast.error(`تعذر رفع الصورة: ${error.message}`);
    },
  });

  return (
    <div className="p-6">
      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-xl font-semibold text-foreground">استوديو الصور</h1>
        <Badge variant="gold">Mock AI</Badge>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        ارفع صورة منتج لمعاينة أربع معالجات مقترحة. هذه معاينات Mock توضح الفكرة بصريًا وليست معالجة صور حقيقية بعد.
      </p>

      <label
        className={cn(
          "mb-8 flex h-40 max-w-md cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
          isUploading && "pointer-events-none opacity-60",
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            if (files.length) startUpload(files);
            e.target.value = "";
          }}
        />
        {isUploading ? <Loader2 className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
        <span className="text-sm">{isUploading ? "جارٍ الرفع..." : "ارفع صورة منتج"}</span>
      </label>

      {sourceUrl ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image src={sourceUrl} alt="الصورة الأصلية" fill className="object-contain p-3" />
            </div>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground">الصورة الأصلية</h3>
            </CardContent>
          </Card>

          {studio.isPending ? (
            <div className="col-span-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> جارٍ إنشاء المعاينات...
            </div>
          ) : (
            variants.map((variant) => <VariantPreview key={variant.mode} variant={variant} sourceUrl={sourceUrl} />)
          )}
        </div>
      ) : (
        <div className="flex max-w-md items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4" /> ارفع صورة لبدء المعاينة.
        </div>
      )}
    </div>
  );
}
