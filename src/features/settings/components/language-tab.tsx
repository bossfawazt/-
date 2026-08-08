"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currentLocale, setLocale } from "@/lib/locale";

const OPTIONS = [
  { value: "ar" as const, labelAr: "العربية", labelEn: "Arabic", dir: "من اليمين إلى اليسار" },
  { value: "en" as const, labelAr: "الإنجليزية", labelEn: "English", dir: "من اليسار إلى اليمين" },
];

/** docs/UIUX-touq.md #C.13: Settings > Language & Region — mirrors the global toggle (§A.4). */
export function LanguageTab() {
  const [locale, setLocaleState] = React.useState<"ar" | "en">(() =>
    typeof document === "undefined" ? "ar" : currentLocale(),
  );

  function handleSelect(value: "ar" | "en") {
    setLocale(value);
    setLocaleState(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>اللغة والمنطقة</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 text-start transition-colors",
                locale === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{option.labelAr}</p>
                <p className="text-xs text-muted-foreground">{option.dir}</p>
              </div>
              {locale === option.value ? <Check className="size-4 text-primary" /> : null}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          يتم تطبيق اللغة والاتجاه على واجهة المنصة بالكامل فورًا. المنطقة/وحدات القياس مضبوطة على المملكة العربية السعودية (ريال سعودي، تقويم ميلادي).
        </p>
      </CardContent>
    </Card>
  );
}
