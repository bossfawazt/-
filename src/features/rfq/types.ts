import type { RfqStatus, QuoteStatus } from "@/generated/prisma/client";

export interface RfqQuote {
  id: string;
  status: QuoteStatus;
  quotedQty: number;
  quotedUnitPriceMinor: number;
  leadTimeDays: number;
  validUntil: string;
}

export interface RfqMessageData {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
}

export interface RfqDetailData {
  id: string;
  status: RfqStatus;
  requestedQty: number;
  targetPriceMinor: number | null;
  customizationNotes: string | null;
  createdAt: string;
  merchant: { legalNameAr: string };
  supplier: { legalNameAr: string; verificationStatus: string };
  product: { titleAr: string } | null;
  messages: RfqMessageData[];
  quotes: RfqQuote[];
}
