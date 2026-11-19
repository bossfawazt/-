/**
 * أرقام الجوال السعودية: يقبل 05XXXXXXXX أو 5XXXXXXXX أو 9665XXXXXXXX أو +9665XXXXXXXX
 * مع مسافات أو شرطات أو أرقام عربية-هندية، ويعيد الصيغة الدولية +9665XXXXXXXX.
 */
const ARABIC_INDIC = /[٠-٩]/g;
const EASTERN_ARABIC = /[۰-۹]/g;

export function toLatinDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EASTERN_ARABIC, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export function normalizeSaudiMobile(input: string): string | null {
  const digits = toLatinDigits(input).replace(/[\s\-()]/g, "");
  const m = /^(?:\+?966|00966|0)?(5\d{8})$/.exec(digits);
  return m ? `+966${m[1]}` : null;
}

/** عرض الرقم بصيغة محلية مقروءة: 05X XXX XXXX */
export function formatSaudiMobile(e164: string | null | undefined): string {
  if (!e164) return "";
  const m = /^\+?966(5\d)(\d{3})(\d{4})$/.exec(e164);
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : e164;
}
