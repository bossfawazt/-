const dateFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "long", year: "numeric" });
const numberFmt = new Intl.NumberFormat("ar-SA-u-nu-latn");

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  return dateFmt.format(typeof value === "string" ? new Date(value) : value);
}

export function formatNumber(value: number | null | undefined): string {
  return numberFmt.format(value ?? 0);
}

export function formatSar(value: number | null | undefined): string {
  return `${numberFmt.format(Math.round(value ?? 0))} ر.س`;
}
