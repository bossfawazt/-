"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * docs/UIUX-touq.md #A.4: lives in the same global position on every page;
 * switching triggers a full layout mirror (lang/dir), not just a string swap.
 *
 * Scope note: this toggles the real dir/lang mechanism verified in Phase 3
 * (the whole design system mirrors correctly under dir="ltr"). Translating
 * every page's Arabic copy into English is a content task tracked
 * separately from this structural RTL support, so EN currently mirrors the
 * layout without translated strings yet.
 */
export function LanguageToggle() {
  function toggleLocale() {
    const isArabic = document.documentElement.lang === "ar";
    const nextLocale = isArabic ? "en" : "ar";
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
  }

  return (
    <Button type="button" variant="icon" size="icon" onClick={toggleLocale} aria-label="تبديل اللغة">
      <Languages className="size-4.5" />
    </Button>
  );
}
