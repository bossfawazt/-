"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileScan, Loader2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCatalogScannerMutation, usePublishDraftsMutation, type ProductDraft } from "@/features/ai/hooks";
import { DraftReviewList } from "@/features/ai/components/draft-review-list";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

const STAGES = ["جارٍ الفحص (Scanning)...", "جارٍ استخراج المنتجات (Extracting)...", "جارٍ تجهيز المسودات (Preparing)..."];

/** New: AI Catalog Scanner — upload an existing catalog (PDF/images/ZIP) and review AI-extracted product drafts. */
export function CatalogScannerClient() {
  const [stage, setStage] = React.useState(0);
  const [drafts, setDrafts] = React.useState<ProductDraft[]>([]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const scanner = useCatalogScannerMutation();
  const publish = usePublishDraftsMutation();
  const stageTimers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const { startUpload, isUploading } = useUploadThing("catalogSourceFile", {
    onClientUploadComplete: async (files) => {
      const file = files[0];
      const url = file?.ufsUrl ?? file?.url;
      if (!url) return;

      setDrafts([]);
      setSelected(new Set());
      setStage(0);
      stageTimers.current.forEach(clearTimeout);
      stageTimers.current = [setTimeout(() => setStage(1), 900), setTimeout(() => setStage(2), 1800)];

      try {
        const result = await scanner.mutateAsync({ fileUrl: url, fileName: file.name });
        setDrafts(result.drafts);
        setSelected(new Set(result.drafts.map((_, i) => i)));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذر فحص الملف");
      } finally {
        stageTimers.current.forEach(clearTimeout);
      }
    },
    onUploadError: (error) => {
      toast.error(`تعذر رفع الملف: ${error.message}`);
    },
  });

  React.useEffect(() => () => stageTimers.current.forEach(clearTimeout), []);

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function updateTitle(index: number, titleAr: string) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, titleAr } : d)));
  }

  async function handlePublish() {
    const toPublish = drafts.filter((_, i) => selected.has(i));
    try {
      const result = await publish.mutateAsync(toPublish);
      toast.success(`تم إنشاء ${result.products.length} مسودة منتج في «منتجاتي»`);
      setDrafts((prev) => prev.filter((_, i) => !selected.has(i)));
      setSelected(new Set());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر نشر المسودات");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-xl font-semibold text-foreground">ماسح الكتالوج</h1>
        <Badge variant="gold">Mock AI</Badge>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        ارفع كتالوجك الحالي (PDF أو صور أو ملف مضغوط) وسيقترح النظام مسودات منتجات جاهزة للمراجعة والتعديل قبل النشر.
      </p>

      {!scanner.isPending && !drafts.length ? (
        <label
          className={cn(
            "flex h-40 max-w-md cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          <input
            type="file"
            accept="application/pdf,image/*,.zip"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (files.length) startUpload(files);
              e.target.value = "";
            }}
          />
          {isUploading ? <Loader2 className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
          <span className="text-sm">{isUploading ? "جارٍ الرفع..." : "ارفع ملف الكتالوج (PDF / صور / ZIP)"}</span>
        </label>
      ) : null}

      {scanner.isPending ? (
        <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
          <FileScan className="size-8 animate-pulse text-primary" />
          <p className="text-sm font-medium text-foreground">{STAGES[stage]}</p>
        </div>
      ) : null}

      {drafts.length ? (
        <DraftReviewList
          drafts={drafts}
          selected={selected}
          onToggle={toggle}
          onTitleChange={updateTitle}
          onPublish={handlePublish}
          isPublishing={publish.isPending}
        />
      ) : null}
    </div>
  );
}
