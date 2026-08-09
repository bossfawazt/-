"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { ProductDraft } from "@/features/ai/hooks";

interface DraftReviewListProps {
  drafts: ProductDraft[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onTitleChange: (index: number, titleAr: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
}

/** Shared review grid for AI-generated product drafts (Catalog Scanner + Bulk Import) — every field stays editable before anything is created. */
export function DraftReviewList({ drafts, selected, onToggle, onTitleChange, onPublish, isPublishing }: DraftReviewListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          تم استخراج <span className="font-semibold text-foreground">{drafts.length}</span> مسودة منتج. راجع وعدّل ثم انشر المحدد
          كمسودات في «منتجاتي» لإكمال السعر والمخزون قبل النشر الفعلي.
        </p>
        <Button onClick={onPublish} loading={isPublishing} disabled={!selected.size}>
          <Check className="size-4" /> نشر المحدد ({selected.size})
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft, index) => (
          <Card key={index} className={selected.has(index) ? "border-primary" : undefined}>
            <div className="relative aspect-[4/3] bg-muted">
              <Image src={draft.imageUrl} alt={draft.titleAr} fill className="object-cover" />
              <div className="absolute start-2 top-2">
                <Checkbox checked={selected.has(index)} onCheckedChange={() => onToggle(index)} className="bg-card" />
              </div>
            </div>
            <CardContent className="flex flex-col gap-2 p-4">
              <Input value={draft.titleAr} onChange={(e) => onTitleChange(index, e.target.value)} className="text-sm font-medium" />
              <p className="line-clamp-2 text-xs text-muted-foreground">{draft.descriptionAr}</p>
              <div className="flex flex-wrap gap-1">
                {draft.keywords.slice(0, 3).map((kw) => (
                  <Badge key={kw} variant="outline">
                    {kw}
                  </Badge>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">دقة الاقتراح التقديرية: {Math.round(draft.confidence * 100)}%</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
