import { describe, expect, it } from "vitest";
import { formatSaudiMobile, normalizeSaudiMobile } from "./phone";
import { contactSchema, newProjectSchema, otpSchema, safeNextPath, saudiMobileSchema } from "./schemas";

describe("normalizeSaudiMobile", () => {
  it.each([
    ["0501234567", "+966501234567"],
    ["501234567", "+966501234567"],
    ["+966501234567", "+966501234567"],
    ["966501234567", "+966501234567"],
    ["00966501234567", "+966501234567"],
    ["050 123 4567", "+966501234567"],
    ["٠٥٠١٢٣٤٥٦٧", "+966501234567"],
  ])("يقبل %s", (input, expected) => {
    expect(normalizeSaudiMobile(input)).toBe(expected);
  });

  it.each(["0401234567", "05012345", "+971501234567", "abc", ""])("يرفض %s", (input) => {
    expect(normalizeSaudiMobile(input)).toBeNull();
  });

  it("يعرض الرقم بصيغة محلية", () => {
    expect(formatSaudiMobile("+966501234567")).toBe("050 123 4567");
  });
});

describe("schemas", () => {
  it("saudiMobileSchema يعيد صيغة دولية", () => {
    expect(saudiMobileSchema.parse("0551112222")).toBe("+966551112222");
    expect(saudiMobileSchema.safeParse("123").success).toBe(false);
  });

  it("otpSchema يقبل 6 أرقام فقط بما فيها العربية", () => {
    expect(otpSchema.parse("١٢٣٤٥٦")).toBe("123456");
    expect(otpSchema.safeParse("12345").success).toBe(false);
  });

  it("safeNextPath يمنع إعادة التوجيه الخارجية", () => {
    expect(safeNextPath("/design")).toBe("/design");
    expect(safeNextPath("//evil.com")).toBe("");
    expect(safeNextPath("https://evil.com")).toBe("");
    expect(safeNextPath("/\\evil.com")).toBe("");
    expect(safeNextPath(undefined)).toBe("");
  });

  it("contactSchema يرفض المصيدة المعبأة", () => {
    const base = { fullName: "سارة", phone: "0501234567", topic: "general", message: "أرغب في الاستفسار عن الخدمة" };
    expect(contactSchema.safeParse(base).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, website: "spam" }).success).toBe(false);
  });

  it("newProjectSchema يقصر المدينة على الرياض", () => {
    const base = { name: "مطبخ الفيلا", district: "الملقا", propertyType: "villa", workType: "renovation" };
    expect(newProjectSchema.safeParse({ ...base, city: "الرياض" }).success).toBe(true);
    expect(newProjectSchema.safeParse({ ...base, city: "جدة" }).success).toBe(false);
  });
});
