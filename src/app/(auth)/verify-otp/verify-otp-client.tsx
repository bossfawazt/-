"use client";

import { useRouter } from "next/navigation";
import { OtpForm } from "@/features/auth/components/otp-form";
import type { OtpPurpose } from "@/generated/prisma/client";

export function VerifyOtpClient({
  phone,
  purpose,
  callbackUrl,
}: {
  phone: string;
  purpose: OtpPurpose;
  callbackUrl?: string;
}) {
  const router = useRouter();

  function handleVerified() {
    if (purpose === "REGISTER") {
      router.push("/onboarding");
    } else {
      router.push(callbackUrl ?? "/");
    }
    router.refresh();
  }

  return <OtpForm phone={phone} purpose={purpose} onVerified={handleVerified} />;
}
