"use client";

import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import type { ProductFormInput } from "@/lib/validations/product";

/** docs/UIUX-touq.md #C.8: product photo upload via UploadThing, first image is primary by default. */
export function MediaField() {
  const { control, formState } = useFormContext<ProductFormInput>();
  const mediaArray = useFieldArray({ control, name: "media" });

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (files) => {
      for (const file of files) {
        mediaArray.append({ url: file.ufsUrl ?? file.url, isPrimary: mediaArray.fields.length === 0 });
      }
    },
    onUploadError: (error) => {
      toast.error(`تعذر رفع الصورة: ${error.message}`);
    },
  });

  function setPrimary(index: number) {
    mediaArray.fields.forEach((_, i) => mediaArray.update(i, { ...mediaArray.fields[i], isPrimary: i === index }));
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-foreground">صور المنتج</span>
      <div className="flex flex-wrap gap-3">
        {mediaArray.fields.map((field, index) => (
          <div key={field.id} className="group relative size-28 overflow-hidden rounded-md border border-border">
            <Image src={field.url} alt="" fill sizes="112px" className="object-cover" />
            {field.isPrimary ? (
              <span className="absolute start-1 top-1 rounded-full bg-primary p-1 text-primary-foreground">
                <Star className="size-3 fill-current" />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setPrimary(index)}
                className="absolute start-1 top-1 rounded-full bg-card/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                title="جعلها الصورة الرئيسية"
              >
                <Star className="size-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => mediaArray.remove(index)}
              className="absolute end-1 top-1 rounded-full bg-card/90 p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="حذف الصورة"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}

        <label
          className={cn(
            "flex size-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
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
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
          <span className="text-xs">إضافة صور</span>
        </label>
      </div>
      {formState.errors.media ? (
        <p className="text-sm font-medium text-destructive">{formState.errors.media.message as string}</p>
      ) : null}
    </div>
  );
}
