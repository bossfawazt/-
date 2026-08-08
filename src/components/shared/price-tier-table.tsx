import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PricingTierData } from "@/types";

interface PriceTierTableProps {
  tiers: PricingTierData[];
  /** Highlights the row matching the merchant's currently entered quantity — UIUX #C.7. */
  activeQty?: number;
}

export function PriceTierTable({ tiers, activeQty }: PriceTierTableProps) {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الكمية</TableHead>
          <TableHead>سعر الوحدة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((tier) => {
          const isActive =
            typeof activeQty === "number" &&
            activeQty >= tier.minQty &&
            (tier.maxQty == null || activeQty <= tier.maxQty);
          return (
            <TableRow key={`${tier.minQty}-${tier.maxQty ?? "plus"}`} className={cn(isActive && "bg-primary/10")}>
              <TableCell className={cn("font-medium", isActive && "text-primary")}>
                {tier.maxQty ? `${tier.minQty}–${tier.maxQty}` : `+${tier.minQty}`}
              </TableCell>
              <TableCell className={cn(isActive && "font-semibold text-primary")}>
                {formatMoney(tier.unitPriceMinor, tier.currency)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
