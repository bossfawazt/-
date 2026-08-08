"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useSendOtpMutation } from "@/features/auth/hooks";
import type { OtpPurpose } from "@/generated/prisma/client";

interface OtpFormProps {
  phone: string;
  purpose: OtpPurpose;
  /** Where to send the user once verification succeeds. */
  onVerified: () => void;
}

const RESEND_COOLDOWN_SECONDS = 45;

/** docs/UIUX-touq.md #C.12 screen 3: 6-segment OTP, auto-submit, resend countdown. */
export function OtpForm({ phone, purpose, onVerified }: OtpFormProps) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [invalid, setInvalid] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(RESEND_COOLDOWN_SECONDS);
  const sendOtp = useSendOtpMutation();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function verify(fullCode: string) {
    setVerifying(true);
    setInvalid(false);
    const result = await signIn("otp", { phone, code: fullCode, purpose, redirect: false });
    setVerifying(false);

    if (result?.error) {
      setInvalid(true);
      setCode("");
      toast.error("رمز التحقق غير صحيح، حاول مرة أخرى");
      return;
    }

    onVerified();
  }

  async function handleResend() {
    try {
      await sendOtp.mutateAsync({ phone, purpose });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("تم إرسال رمز جديد");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال الرمز");
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-sm text-muted-foreground">
        أدخل الرمز المكوّن من 6 أرقام المُرسل إلى <span dir="ltr" className="font-medium text-foreground">{phone}</span>
      </p>

      <InputOTP
        maxLength={6}
        value={code}
        onChange={(value) => {
          setCode(value);
          setInvalid(false);
          if (value.length === 6) verify(value);
        }}
        disabled={verifying}
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, i) => (
            <InputOTPSlot key={i} index={i} invalid={invalid} />
          ))}
        </InputOTPGroup>
      </InputOTP>

      <Button
        type="button"
        size="lg"
        className="w-full"
        loading={verifying}
        disabled={code.length !== 6}
        onClick={() => verify(code)}
      >
        تحقق
      </Button>

      <div className="text-sm text-muted-foreground">
        {cooldown > 0 ? (
          <span>إعادة الإرسال خلال 0:{cooldown.toString().padStart(2, "0")}</span>
        ) : (
          <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
            إعادة إرسال الرمز
          </button>
        )}
      </div>

      <button type="button" onClick={() => router.back()} className="text-xs text-muted-foreground hover:text-foreground">
        تغيير رقم الهاتف
      </button>
    </div>
  );
}
