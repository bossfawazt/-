"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

/** docs/UIUX-touq.md #A.6 Stepper: −/N/+, min-reached at MOQ, max-reached. */
export function QuantityStepper({ value, onChange, min = 1, max, step = 1, className }: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = typeof max === "number" && value >= max;

  function clamp(next: number) {
    let clamped = next;
    if (clamped < min) clamped = min;
    if (typeof max === "number" && clamped > max) clamped = max;
    onChange(clamped);
  }

  return (
    <div className={cn("inline-flex items-center rounded-md border border-input", className)}>
      <Button
        type="button"
        variant="icon"
        size="icon"
        className="rounded-e-none border-0"
        disabled={atMin}
        onClick={() => clamp(value - step)}
        aria-label="إنقاص الكمية"
      >
        <Minus className="size-4" />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        className="h-10 w-16 border-x border-input bg-transparent text-center text-sm font-medium focus:outline-none"
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(parsed)) clamp(parsed);
        }}
      />
      <Button
        type="button"
        variant="icon"
        size="icon"
        className="rounded-s-none border-0"
        disabled={atMax}
        onClick={() => clamp(value + step)}
        aria-label="زيادة الكمية"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
