import { db } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { otpSendSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = otpSendSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { phone, purpose } = parsed.data;

  if (purpose === "LOGIN") {
    const user = await db.user.findUnique({ where: { phone } });
    if (!user || user.status !== "ACTIVE") {
      // Same response either way — do not reveal whether a phone is registered.
      return apiOk({ retryAfterSeconds: 45 });
    }
  }

  const result = await issueOtp(phone, purpose);
  if (!result.ok) {
    return apiError("otp_cooldown", "يرجى الانتظار قبل طلب رمز جديد", 429, {
      retryAfterSeconds: result.retryAfterSeconds,
    });
  }

  return apiOk({ retryAfterSeconds: result.retryAfterSeconds });
}
