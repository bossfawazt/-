import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "./labels";

/** مؤشر خطوات المعالج — مضغوط على الجوال */
export function WizardSteps({ current }: { current: number }) {
  return (
    <nav aria-label="خطوات التصميم">
      <p className="text-sm text-muted-foreground sm:hidden">
        الخطوة {Math.min(current, WIZARD_STEPS.length)} من {WIZARD_STEPS.length}:{" "}
        <span className="font-semibold text-foreground">{WIZARD_STEPS[Math.min(current, WIZARD_STEPS.length) - 1]}</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary sm:hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(Math.min(current, 6) / 6) * 100}%` }} />
      </div>
      <ol className="hidden grid-cols-6 gap-2 sm:grid">
        {WIZARD_STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <li key={label} aria-current={active ? "step" : undefined} className="flex flex-col gap-2">
              <span className={cn("h-1.5 rounded-full", done || active ? "bg-primary" : "bg-secondary")} />
              <span className={cn("flex items-center gap-1.5 text-xs", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {done ? <Check className="size-3.5 text-primary" aria-hidden /> : <span aria-hidden>{n}.</span>}
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
