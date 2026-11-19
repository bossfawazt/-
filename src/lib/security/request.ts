import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** بصمة غير قابلة للعكس لعنوان IP (لتحديد المعدل دون تخزين العنوان نفسه). */
export async function getClientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.IP_HASH_SALT ?? "mimar-almanzil";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
