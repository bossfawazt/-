import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { notifyOrganization } from "@/server/services/notification.service";

export class AdminActionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function logAudit(actorUserId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
  await db.auditLog.create({
    data: { actorUserId, action, entityType, entityId, metadataJson: metadata as Prisma.InputJsonValue | undefined },
  });
}

// ---------------------------------------------------------------------------
// Overview (docs/UIUX-touq.md #C.6)
// ---------------------------------------------------------------------------

export async function getOverviewStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalSuppliers, totalMerchants, pendingVerifications, openDisputes, rfqVolumeMtd, rfqTotal, orderTotal] = await Promise.all([
    db.organization.count({ where: { type: "SUPPLIER", status: { not: "SUSPENDED" } } }),
    db.organization.count({ where: { type: "MERCHANT", status: { not: "SUSPENDED" } } }),
    db.organization.count({ where: { verificationStatus: "PENDING" } }),
    db.dispute.count({ where: { status: { in: ["OPEN", "INVESTIGATING"] } } }),
    db.rfq.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.rfq.count(),
    db.order.count(),
  ]);

  const conversionPct = rfqTotal > 0 ? Math.round((orderTotal / rfqTotal) * 1000) / 10 : 0;

  return { totalSuppliers, totalMerchants, pendingVerifications, openDisputes, rfqVolumeMtd, conversionPct };
}

export async function getRecentActivity(limit = 20) {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { name: true } } },
  });

  return logs.map((log) => ({
    id: log.id,
    actorName: log.actor?.name ?? "النظام",
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    createdAt: log.createdAt.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Verification Queue
// ---------------------------------------------------------------------------

export async function getVerificationQueue() {
  const organizations = await db.organization.findMany({
    where: { verificationStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      region: { select: { nameAr: true } },
      verificationDocuments: { orderBy: { createdAt: "desc" } },
    },
  });

  return organizations.map((org) => ({
    id: org.id,
    type: org.type,
    legalNameAr: org.legalNameAr,
    city: org.city,
    regionNameAr: org.region?.nameAr ?? null,
    crNumber: org.crNumber,
    maroofId: org.maroofId,
    submittedAt: org.createdAt.toISOString(),
    documents: org.verificationDocuments.map((doc) => ({ id: doc.id, docType: doc.docType, fileUrl: doc.fileUrl })),
  }));
}

export async function approveOrganization(organizationId: string, adminUserId: string) {
  const organization = await db.organization.findUnique({ where: { id: organizationId } });
  if (!organization) throw new AdminActionError("المنشأة غير موجودة");

  await db.$transaction([
    db.organization.update({ where: { id: organizationId }, data: { verificationStatus: "VERIFIED", status: "ACTIVE" } }),
    db.verificationDocument.updateMany({
      where: { organizationId, status: "PENDING" },
      data: { status: "VERIFIED", reviewedByUserId: adminUserId, reviewedAt: new Date() },
    }),
  ]);

  await logAudit(adminUserId, "organization.approve", "Organization", organizationId);
  await notifyOrganization({
    organizationId,
    eventType: "verification.approved",
    title: "تم توثيق المنشأة",
    body: "تهانينا! تم توثيق منشأتك ويمكنك الآن استخدام كافة ميزات المنصة.",
    linkUrl: "/settings",
  });
}

export async function rejectOrganization(organizationId: string, adminUserId: string, reason: string) {
  const organization = await db.organization.findUnique({ where: { id: organizationId } });
  if (!organization) throw new AdminActionError("المنشأة غير موجودة");

  await db.$transaction([
    db.organization.update({ where: { id: organizationId }, data: { verificationStatus: "REJECTED" } }),
    db.verificationDocument.updateMany({
      where: { organizationId, status: "PENDING" },
      data: { status: "REJECTED", reviewedByUserId: adminUserId, reviewedAt: new Date(), rejectionReason: reason },
    }),
  ]);

  await logAudit(adminUserId, "organization.reject", "Organization", organizationId, { reason });
  await notifyOrganization({
    organizationId,
    eventType: "verification.rejected",
    title: "تعذّر توثيق المنشأة",
    body: `لم تتم الموافقة على طلب التوثيق: ${reason}`,
    linkUrl: "/settings",
  });
}

// ---------------------------------------------------------------------------
// Listings Moderation
// ---------------------------------------------------------------------------

export async function getModerationQueue() {
  const products = await db.product.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: {
      supplier: { select: { id: true, legalNameAr: true } },
      category: { select: { nameAr: true } },
      media: { where: { isPrimary: true }, take: 1 },
    },
  });

  return products.map((p) => ({
    id: p.id,
    titleAr: p.titleAr,
    supplierId: p.supplier.id,
    supplierName: p.supplier.legalNameAr,
    categoryName: p.category.nameAr,
    imageUrl: p.media[0]?.url ?? null,
    submittedAt: p.updatedAt.toISOString(),
  }));
}

export async function approveProduct(productId: string, adminUserId: string) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "PENDING_REVIEW") throw new AdminActionError("المنتج غير موجود أو ليس قيد المراجعة");

  await db.product.update({
    where: { id: productId },
    data: { status: "LIVE", publishedAt: product.publishedAt ?? new Date(), rejectionReason: null },
  });

  await logAudit(adminUserId, "product.approve", "Product", productId);
  await notifyOrganization({
    organizationId: product.supplierId,
    eventType: "product.approved",
    title: "تمت الموافقة على المنتج",
    body: `تم نشر منتجك "${product.titleAr}" في السوق.`,
    linkUrl: `/supplier/products/${productId}/edit`,
  });
}

export async function rejectProduct(productId: string, adminUserId: string, reason: string) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "PENDING_REVIEW") throw new AdminActionError("المنتج غير موجود أو ليس قيد المراجعة");

  await db.product.update({ where: { id: productId }, data: { status: "REJECTED", rejectionReason: reason } });

  await logAudit(adminUserId, "product.reject", "Product", productId, { reason });
  await notifyOrganization({
    organizationId: product.supplierId,
    eventType: "product.rejected",
    title: "تم رفض المنتج",
    body: `تعذّر نشر منتجك "${product.titleAr}": ${reason}`,
    linkUrl: `/supplier/products/${productId}/edit`,
  });
}

export async function deleteProduct(productId: string, adminUserId: string) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new AdminActionError("المنتج غير موجود");

  await db.product.delete({ where: { id: productId } });
  await logAudit(adminUserId, "product.delete", "Product", productId, { titleAr: product.titleAr });
}

// ---------------------------------------------------------------------------
// Users & Organizations
// ---------------------------------------------------------------------------

export interface OrganizationListFilters {
  type?: "SUPPLIER" | "MERCHANT";
  query?: string;
  page?: number;
  limit?: number;
}

export async function getOrganizations(filters: OrganizationListFilters) {
  const { page = 1, limit = 20 } = filters;
  const where = {
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.query
      ? { legalNameAr: { contains: filters.query, mode: "insensitive" as const } }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        legalNameAr: true,
        city: true,
        verificationStatus: true,
        status: true,
        ratingAvg: true,
        ratingCount: true,
        createdAt: true,
        _count: { select: { products: true, ordersAsMerchant: true, ordersAsSupplier: true } },
      },
    }),
    db.organization.count({ where }),
  ]);

  const items = rows.map((org) => ({
    id: org.id,
    type: org.type,
    legalNameAr: org.legalNameAr,
    city: org.city,
    verificationStatus: org.verificationStatus,
    status: org.status,
    ratingAvg: Number(org.ratingAvg),
    ratingCount: org.ratingCount,
    createdAt: org.createdAt.toISOString(),
    productCount: org._count.products,
    orderCount: org.type === "SUPPLIER" ? org._count.ordersAsSupplier : org._count.ordersAsMerchant,
  }));

  return { items, total, page, limit, hasMore: page * limit < total };
}

export async function getOrganizationDetail(organizationId: string) {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      region: { select: { nameAr: true } },
      members: { include: { user: { select: { id: true, name: true, phone: true } }, role: true } },
    },
  });
  if (!organization) return null;

  const recentOrders = await db.order.findMany({
    where: organization.type === "SUPPLIER" ? { supplierId: organizationId } : { merchantId: organizationId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, status: true, totalAmountMinor: true, currency: true, createdAt: true },
  });

  return {
    id: organization.id,
    type: organization.type,
    legalNameAr: organization.legalNameAr,
    legalNameEn: organization.legalNameEn,
    city: organization.city,
    regionNameAr: organization.region?.nameAr ?? null,
    crNumber: organization.crNumber,
    maroofId: organization.maroofId,
    verificationStatus: organization.verificationStatus,
    status: organization.status,
    ratingAvg: Number(organization.ratingAvg),
    ratingCount: organization.ratingCount,
    createdAt: organization.createdAt.toISOString(),
    members: organization.members.map((m) => ({
      userId: m.user.id,
      name: m.user.name,
      phone: m.user.phone,
      roleName: m.role.name,
      status: m.status,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      status: o.status,
      totalAmountMinor: o.totalAmountMinor,
      currency: o.currency,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

export async function suspendOrganization(organizationId: string, adminUserId: string) {
  const organization = await db.organization.findUnique({ where: { id: organizationId } });
  if (!organization) throw new AdminActionError("المنشأة غير موجودة");

  await db.organization.update({ where: { id: organizationId }, data: { status: "SUSPENDED" } });
  await logAudit(adminUserId, "organization.suspend", "Organization", organizationId);
  await notifyOrganization({
    organizationId,
    eventType: "account.suspended",
    title: "تم تعليق الحساب",
    body: "تم تعليق حساب منشأتك من قبل إدارة المنصة. تواصل مع الدعم لمزيد من التفاصيل.",
  });
}

export async function reinstateOrganization(organizationId: string, adminUserId: string) {
  const organization = await db.organization.findUnique({ where: { id: organizationId } });
  if (!organization) throw new AdminActionError("المنشأة غير موجودة");

  await db.organization.update({ where: { id: organizationId }, data: { status: "ACTIVE" } });
  await logAudit(adminUserId, "organization.reinstate", "Organization", organizationId);
  await notifyOrganization({
    organizationId,
    eventType: "account.reinstated",
    title: "تم إعادة تفعيل الحساب",
    body: "تم إعادة تفعيل حساب منشأتك، يمكنك الآن استخدام المنصة بشكل طبيعي.",
  });
}

// ---------------------------------------------------------------------------
// Orders & Disputes
// ---------------------------------------------------------------------------

export async function getDisputedOrders() {
  const disputes = await db.dispute.findMany({
    where: { status: { in: ["OPEN", "INVESTIGATING"] } },
    orderBy: { createdAt: "asc" },
    include: {
      order: {
        include: {
          merchant: { select: { legalNameAr: true } },
          supplier: { select: { legalNameAr: true } },
        },
      },
      raisedBy: { select: { name: true } },
    },
  });

  return disputes.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    reason: d.reason,
    status: d.status,
    raisedByName: d.raisedBy.name,
    merchantName: d.order.merchant.legalNameAr,
    supplierName: d.order.supplier.legalNameAr,
    totalAmountMinor: d.order.totalAmountMinor,
    currency: d.order.currency,
    createdAt: d.createdAt.toISOString(),
  }));
}

export async function resolveDispute(
  disputeId: string,
  adminUserId: string,
  resolution: "RESOLVED" | "REJECTED",
  notes: string,
) {
  const dispute = await db.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new AdminActionError("النزاع غير موجود");

  await db.$transaction([
    db.dispute.update({
      where: { id: disputeId },
      data: { status: resolution, resolutionNotes: notes, resolvedByUserId: adminUserId, resolvedAt: new Date() },
    }),
    db.order.update({ where: { id: dispute.orderId }, data: { status: "COMPLETED" } }),
  ]);

  await logAudit(adminUserId, `dispute.${resolution.toLowerCase()}`, "Dispute", disputeId, { notes });
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function getReports() {
  const [rfqTotal, orderTotal, orderStatusCounts, topAttributeValues, supplierLeaderboard] = await Promise.all([
    db.rfq.count(),
    db.order.count(),
    db.order.groupBy({ by: ["status"], _count: { status: true } }),
    db.productAttributeValue.groupBy({
      by: ["attributeOptionId"],
      where: { product: { status: "LIVE" }, attributeOptionId: { not: null } },
      _count: { attributeOptionId: true },
      orderBy: { _count: { attributeOptionId: "desc" } },
      take: 6,
    }),
    db.organization.findMany({
      where: { type: "SUPPLIER", status: "ACTIVE" },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: 5,
      select: { id: true, legalNameAr: true, ratingAvg: true, ratingCount: true, _count: { select: { ordersAsSupplier: true } } },
    }),
  ]);

  const optionIds = topAttributeValues.flatMap((a) => (a.attributeOptionId ? [a.attributeOptionId] : []));
  const options = await db.attributeOption.findMany({
    where: { id: { in: optionIds } },
    include: { attributeDefinition: { select: { labelAr: true } } },
  });
  const optionById = new Map(options.map((o) => [o.id, o]));

  return {
    rfqTotal,
    orderTotal,
    conversionPct: rfqTotal > 0 ? Math.round((orderTotal / rfqTotal) * 1000) / 10 : 0,
    orderStatusBreakdown: orderStatusCounts.map((row) => ({ status: row.status, count: row._count.status })),
    topAttributeValues: topAttributeValues
      .map((row) => {
        const option = row.attributeOptionId ? optionById.get(row.attributeOptionId) : undefined;
        return option
          ? { attributeLabelAr: option.attributeDefinition.labelAr, valueAr: option.valueAr, count: row._count.attributeOptionId }
          : null;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null),
    supplierLeaderboard: supplierLeaderboard.map((s) => ({
      id: s.id,
      legalNameAr: s.legalNameAr,
      ratingAvg: Number(s.ratingAvg),
      ratingCount: s.ratingCount,
      completedOrders: s._count.ordersAsSupplier,
    })),
  };
}
