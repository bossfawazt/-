"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBulkImportMutation, usePublishDraftsMutation, type ProductDraft } from "@/features/ai/hooks";
import { DraftReviewList } from "@/features/ai/components/draft-review-list";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

/** New: AI Bulk Import — upload several product photos at once and review the generated drafts. */
export function BulkImportClient() {
  const [drafts, setDrafts] = React.useState<ProductDraft[]>([]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const bulkImport = useBulkImportMutation();
  const publish = usePublishDraftsMutation();

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: async (files) => {
      const urls = files.map((f) => f.ufsUrl ?? f.url).filter((u): u is string => !!u);
      if (!urls.length) return;

      setDrafts([]);
      setSelected(new Set());
      try {
        const result = await bulkImport.mutateAsync(urls);
        setDrafts(result.drafts);
        setSelected(new Set(result.drafts.map((_, i) => i)));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذر تحليل الصور");
      }
    },
    onUploadError: (error) => {
      toast.error(`تعذر رفع الصور: ${error.message}`);
    },
  });

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
        <h1 className="text-xl font-semibold text-foreground">الاستيراد الجماعي</h1>
        <Badge variant="gold">Mock AI</Badge>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        ارفع عدة صور منتجات دفعة واحدة، وسيقترح النظام اسمًا وتصنيفًا لكل صورة — راجع وعدّل قبل النشر.
      </p>

      {!bulkImport.isPending && !drafts.length ? (
        <label
          className={cn(
            "flex h-40 max-w-md cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (files.length) startUpload(files);
              e.target.value = "";
            }}
          />
          {isUploading ? <Loader2 className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
          <span className="text-sm">{isUploading ? "جارٍ الرفع..." : "ارفع عدة صور منتجات"}</span>
        </label>
      ) : null}

      {bulkImport.isPending ? (
        <div className="flex max-w-md items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> جارٍ تحليل الصور وإنشاء المسودات...
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
