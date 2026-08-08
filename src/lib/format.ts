/**
 * Formatting helpers. docs/UIUX-touq.md #A.3: Western Arabic numerals (0-9)
 * are used everywhere, in both locales, for commerce data (prices, SKUs,
 * quantities) — so these intentionally do NOT use "ar-SA" numeral
 * formatting, which would otherwise render Eastern Arabic-Indic digits.
 */

/** Format a minor-unit amount (halalas) as a SAR price string, e.g. 12000 -> "120 ر.س". */
export function formatMoney(amountMinor: number, currency: string = "SAR", locale: "ar" | "en" = "ar") {
  const amount = amountMinor / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  const symbol = currency === "SAR" ? (locale === "ar" ? "ر.س" : "SAR") : currency;
  return locale === "ar" ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
}

export function formatDate(date: Date | string, locale: "ar" | "en" = "ar") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string, locale: "ar" | "en" = "ar") {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", { numeric: "auto" });

  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let duration = diffSeconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) {
      return rtf.format(Math.round(duration), unit);
    }
    duration /= amount;
  }
  return rtf.format(Math.round(duration), "year");
}

/** e.g. 90 -> "ساعة و30 دقيقة" style average response time, kept simple: "~90 دقيقة". */
export function formatMinutes(minutes: number, locale: "ar" | "en" = "ar") {
  if (minutes < 60) return locale === "ar" ? `${minutes} دقيقة` : `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return locale === "ar" ? `${hours} ساعة` : `${hours}h`;
}
