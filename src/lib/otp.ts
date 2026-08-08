import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { OtpPurpose } from "@/generated/prisma/client";

const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 45;

function generateSixDigitCode() {
  // crypto.randomInt is CSPRNG-backed, unlike Math.random().
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/**
 * Issues a new OTP for a phone number and "delivers" it.
 *
 * No SMS/WhatsApp provider is wired up yet (docs/ARCHITECTURE-touq.md #14
 * lists this as a future integration) — until then, delivery is a
 * server-side console log, matching OTP_PROVIDER=dev-console in .env.example.
 * The provider is intentionally isolated behind this one function so
 * swapping in a real gateway later touches no calling code.
 */
export async function issueOtp(phone: string, purpose: OtpPurpose) {
  const recentOtp = await db.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const secondsSinceIssued = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
    if (secondsSinceIssued < OTP_RESEND_COOLDOWN_SECONDS) {
      return {
        ok: false as const,
        retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceIssued),
      };
    }
  }

  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 10);

  await db.otpCode.create({
    data: {
      phone,
      purpose,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  await deliverOtp(phone, code);

  return { ok: true as const, retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS };
}

async function deliverOtp(phone: string, code: string) {
  const provider = process.env.OTP_PROVIDER ?? "dev-console";

  if (provider === "dev-console") {
    // Stands in for the SMS/WhatsApp Notification Service channel adapters
    // in docs/ARCHITECTURE-touq.md #12 — swap this branch for a real
    // provider call once one is contracted, everything upstream is unchanged.
    console.log(`\n[OTP:${provider}] → ${phone} : ${code} (valid ${OTP_TTL_MINUTES} min)\n`);
    return;
  }

  throw new Error(`Unsupported OTP_PROVIDER "${provider}"`);
}

export async function verifyOtp(phone: string, purpose: OtpPurpose, code: string) {
  const otp = await db.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false as const, reason: "not_found" as const };
  if (otp.expiresAt < new Date()) return { ok: false as const, reason: "expired" as const };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false as const, reason: "too_many_attempts" as const };

  const isValid = await bcrypt.compare(code, otp.codeHash);

  if (!isValid) {
    await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false as const, reason: "invalid" as const };
  }

  await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return { ok: true as const };
}
