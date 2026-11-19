/** القيم النصية المرسلة من النموذج — تُعاد عند الخطأ حتى لا يفقد المستخدم ما كتبه */
export type FormValues = Record<string, string>;

export function formValues(formData: FormData, exclude: string[] = []): FormValues {
  const out: FormValues = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !k.startsWith("$") && !exclude.includes(k)) out[k] = v;
  }
  return out;
}

/** تحويل أخطاء zod إلى خطأ واحد لكل حقل */
export function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const fe: Record<string, string> = {};
  for (const issue of issues) fe[String(issue.path[0])] ??= issue.message;
  return fe;
}
