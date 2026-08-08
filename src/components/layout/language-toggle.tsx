"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentLocale, setLocale } from "@/lib/locale";

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
    setLocale(currentLocale() === "ar" ? "en" : "ar");
  }

  return (
    <Button type="button" variant="icon" size="icon" onClick={toggleLocale} aria-label="تبديل اللغة">
      <Languages className="size-4.5" />
    </Button>
  );
}
