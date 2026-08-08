import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "استعادة كلمة المرور" };

/**
 * Minimal stub for now — docs/UIUX-touq.md #C.12 screen 7 specifies a full
 * OTP-based reset flow (request -> OTP -> new password). The OTP
 * infrastructure it needs already exists (src/lib/otp.ts, OtpForm), so
 * wiring the full flow is a small follow-up, deliberately deferred to keep
 * momentum on Phases 5-11 — same "named shortcut" discipline as
 * docs/ROADMAP-touq.md.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">استعادة كلمة المرور</h1>
      <p className="text-sm text-muted-foreground">
        يمكنك تسجيل الدخول عبر رمز التحقق المرسل إلى جوالك بدلاً من كلمة المرور.
      </p>
      <Button asChild size="lg" className="w-full">
        <Link href="/login">العودة لتسجيل الدخول</Link>
      </Button>
    </div>
  );
}
