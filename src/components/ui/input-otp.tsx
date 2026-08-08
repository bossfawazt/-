"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

/** docs/UIUX-touq.md #A.6 OTP Input: 6-segment, auto-advance, error/success states. */
const InputOTP = React.forwardRef<React.ComponentRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<React.ComponentRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number; invalid?: boolean }
>(({ index, invalid, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext.slots[index];
  const { char, hasFakeCaret, isActive } = slot ?? { char: null, hasFakeCaret: false, isActive: false };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex size-12 items-center justify-center rounded-md border border-input bg-card text-lg font-semibold shadow-sm transition-all",
        isActive && "z-10 border-primary ring-2 ring-ring/30",
        invalid && "border-destructive text-destructive",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-pulse bg-foreground" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

export { InputOTP, InputOTPGroup, InputOTPSlot };
