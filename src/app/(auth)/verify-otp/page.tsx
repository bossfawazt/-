import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyOtpClient } from "./verify-otp-client";

export const metadata: Metadata = { title: "تحقق من رقم الجوال" };

export default async function VerifyOtpPage(props: PageProps<"/verify-otp">) {
  const searchParams = await props.searchParams;
  const phone = typeof searchParams.phone === "string" ? searchParams.phone : "";
  const purpose = searchParams.purpose === "LOGIN" ? "LOGIN" : "REGISTER";
  const callbackUrl = typeof searchParams.callbackUrl === "string" ? searchParams.callbackUrl : undefined;

  if (!phone) redirect("/register");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">تحقق من رقم الجوال</h1>
      </div>
      <VerifyOtpClient phone={phone} purpose={purpose} callbackUrl={callbackUrl} />
    </div>
  );
}
