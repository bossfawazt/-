"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCategoriesQuery } from "@/features/marketplace/hooks";
import type { MarketplaceFilters } from "@/features/marketplace/hooks";

interface FilterPanelProps {
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
  onClear: () => void;
}

const ATTRIBUTE_KEYS = ["style", "fabric", "color", "embroidery", "season", "category"] as const;

/** docs/UIUX-touq.md #C.2 filter panel: style/fabric/color/embroidery/season checkboxes, price range, verified-only. */
export function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const { data: attributeDefs, isLoading } = useCategoriesQuery();

  function toggleAttribute(attrKey: (typeof ATTRIBUTE_KEYS)[number], optionKey: string) {
    const current = new Set(filters[attrKey] ?? []);
    if (current.has(optionKey)) current.delete(optionKey);
    else current.add(optionKey);
    onChange({ ...filters, [attrKey]: Array.from(current) });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">الفلاتر</h2>
        <button type="button" onClick={onClear} className="text-xs font-medium text-primary hover:underline">
          مسح الكل
        </button>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="verified-only" className="text-sm font-normal">
          موردون موثقون فقط
        </Label>
        <Switch
          id="verified-only"
          checked={!!filters.verifiedOnly}
          onCheckedChange={(checked) => onChange({ ...filters, verifiedOnly: checked })}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-foreground">نطاق السعر (ر.س)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="من"
            value={filters.priceMin ?? ""}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="إلى"
            value={filters.priceMax ?? ""}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">جارٍ تحميل الفلاتر...</p>
      ) : (
        attributeDefs
          ?.filter((attr) => (ATTRIBUTE_KEYS as readonly string[]).includes(attr.key))
          .map((attr) => (
            <div key={attr.key}>
              <Separator className="mb-6" />
              <h3 className="mb-3 text-sm font-medium text-foreground">{attr.labelAr}</h3>
              <div className="flex flex-col gap-2.5">
                {attr.options.map((option) => {
                  const attrKey = attr.key as (typeof ATTRIBUTE_KEYS)[number];
                  const checked = (filters[attrKey] ?? []).includes(option.key);
                  return (
                    <label key={option.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                      <Checkbox checked={checked} onCheckedChange={() => toggleAttribute(attrKey, option.key)} />
                      {option.valueAr}
                    </label>
                  );
                })}
              </div>
            </div>
          ))
      )}

      <Button type="button" variant="secondary" onClick={onClear} className="mt-2 lg:hidden">
        مسح الفلاتر
      </Button>
    </div>
  );
}
