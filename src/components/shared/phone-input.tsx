"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string; // full E.164, e.g. "+966501234567"
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
}

/**
 * KSA (+966) phone input — docs/UIUX-touq.md #C.12: "phone number field with
 * KSA (+966) country-code prefix by default". Stores/emits full E.164; the
 * visible field only ever holds the 9 local digits.
 */
export function PhoneInput({ value, onChange, invalid, disabled, id }: PhoneInputProps) {
  const localDigits = value.startsWith("+966") ? value.slice(4) : value.replace(/^\+?966?/, "");

  return (
    <div className={cn("flex items-center rounded-md border border-input bg-card shadow-sm", invalid && "border-destructive")}>
      <span className="flex h-10 shrink-0 items-center border-e border-input px-3 text-sm text-muted-foreground" dir="ltr">
        +966
      </span>
      <Input
        id={id}
        dir="ltr"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="5XXXXXXXX"
        maxLength={9}
        disabled={disabled}
        className="border-0 shadow-none focus-visible:ring-0"
        value={localDigits}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
          onChange(`+966${digits}`);
        }}
      />
    </div>
  );
}
