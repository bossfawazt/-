/** docs/UIUX-touq.md #A.4: switching locale mirrors the whole layout (dir + lang), not just strings. */
export function setLocale(locale: "ar" | "en") {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

export function currentLocale(): "ar" | "en" {
  return document.documentElement.lang === "en" ? "en" : "ar";
}
