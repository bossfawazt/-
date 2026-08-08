"use client";

import { Package, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrganizationType } from "@/generated/prisma/client";

interface RoleChoiceProps {
  value: OrganizationType | null;
  onChange: (value: OrganizationType) => void;
}

/** docs/UIUX-touq.md #C.12 screen 1: "I'm a Merchant" / "I'm a Supplier" cards. */
export function RoleChoice({ value, onChange }: RoleChoiceProps) {
  const options: Array<{ type: OrganizationType; icon: typeof Package; title: string; description: string }> = [
    {
      type: "MERCHANT",
      icon: ShoppingBag,
      title: "أنا تاجر",
      description: "أبحث عن موردي عبايات موثوقين للجملة",
    },
    {
      type: "SUPPLIER",
      icon: Package,
      title: "أنا مورد",
      description: "أريد عرض منتجاتي على تجار الجملة",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.type;
        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center gap-3 rounded-lg border-2 bg-card p-6 text-center transition-colors hover:border-primary/50",
              selected ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="font-semibold text-foreground">{option.title}</span>
            <span className="text-sm text-muted-foreground">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
