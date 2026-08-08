import { db } from "@/lib/db";

/** docs/UIUX-touq.md #C.5: Supplier Dashboard stat tiles + RFQ inbox preview + catalog snapshot. */
export async function getSupplierDashboardStats(supplierId: string) {
  const [newRfqCount, pendingQuoteCount, activeOrderCount, liveProductCount, draftProductCount, recentRfqs, organization] =
    await Promise.all([
      db.rfq.count({ where: { supplierId, status: { in: ["SUBMITTED", "VIEWED"] } } }),
      db.quote.count({ where: { supplierId, status: "PENDING" } }),
      db.order.count({ where: { supplierId, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
      db.product.count({ where: { supplierId, status: "LIVE" } }),
      db.product.count({ where: { supplierId, status: { in: ["DRAFT", "PENDING_REVIEW", "REJECTED"] } } }),
      db.rfq.findMany({
        where: { supplierId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { merchant: { select: { legalNameAr: true } }, product: { select: { titleAr: true } } },
      }),
      db.organization.findUniqueOrThrow({ where: { id: supplierId } }),
    ]);

  return {
    newRfqCount,
    pendingQuoteCount,
    activeOrderCount,
    liveProductCount,
    draftProductCount,
    recentRfqs,
    ratingAvg: Number(organization.ratingAvg),
    ratingCount: organization.ratingCount,
    responseTimeAvgMinutes: organization.responseTimeAvgMinutes,
    verificationStatus: organization.verificationStatus,
  };
}
