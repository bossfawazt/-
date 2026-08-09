"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrganizationType, OrderStatus, DisputeStatus, VerificationStatus, OrganizationStatus } from "@/generated/prisma/client";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "حدث خطأ غير متوقع");
  return json.data as T;
}

// --- Overview -----------------------------------------------------------

export interface AdminOverviewStats {
  totalSuppliers: number;
  totalMerchants: number;
  pendingVerifications: number;
  openDisputes: number;
  rfqVolumeMtd: number;
  conversionPct: number;
}

export interface AdminActivityItem {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => requestJson<{ stats: AdminOverviewStats; activity: AdminActivityItem[] }>("/api/admin/overview"),
    refetchInterval: 30_000,
  });
}

// --- Verification queue --------------------------------------------------

export interface VerificationQueueItem {
  id: string;
  type: OrganizationType;
  legalNameAr: string;
  city: string | null;
  regionNameAr: string | null;
  crNumber: string | null;
  maroofId: string | null;
  submittedAt: string;
  documents: { id: string; docType: string; fileUrl: string }[];
}

export function useVerificationQueueQuery() {
  return useQuery({
    queryKey: ["admin", "verification-queue"],
    queryFn: () => requestJson<VerificationQueueItem[]>("/api/admin/verification-queue"),
  });
}

export function useVerifyOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, action, reason }: { organizationId: string; action: "approve" | "reject"; reason?: string }) =>
      requestJson<{ ok: true }>(`/api/admin/organizations/${organizationId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "approve" ? { action } : { action, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "verification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });
}

// --- Moderation queue ------------------------------------------------------

export interface ModerationQueueItem {
  id: string;
  titleAr: string;
  supplierId: string;
  supplierName: string;
  categoryName: string;
  imageUrl: string | null;
  submittedAt: string;
}

export function useModerationQueueQuery() {
  return useQuery({
    queryKey: ["admin", "moderation-queue"],
    queryFn: () => requestJson<ModerationQueueItem[]>("/api/admin/moderation-queue"),
  });
}

export function useModerateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, action, reason }: { productId: string; action: "approve" | "reject"; reason?: string }) =>
      requestJson<{ ok: true }>(`/api/admin/products/${productId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "approve" ? { action } : { action, reason }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderation-queue"] }),
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => requestJson<{ ok: true }>(`/api/admin/products/${productId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderation-queue"] }),
  });
}

// --- Organizations ---------------------------------------------------------

export interface AdminOrganizationRow {
  id: string;
  type: OrganizationType;
  legalNameAr: string;
  city: string | null;
  verificationStatus: VerificationStatus;
  status: OrganizationStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  productCount: number;
  orderCount: number;
}

export interface AdminOrganizationsResult {
  items: AdminOrganizationRow[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function useAdminOrganizationsQuery(filters: { type?: "SUPPLIER" | "MERCHANT"; q?: string }) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.q) params.set("q", filters.q);
  return useQuery({
    queryKey: ["admin", "organizations", filters],
    queryFn: () => requestJson<AdminOrganizationsResult>(`/api/admin/organizations?${params.toString()}`),
  });
}

export interface AdminOrganizationDetail {
  id: string;
  type: OrganizationType;
  legalNameAr: string;
  legalNameEn: string | null;
  city: string | null;
  regionNameAr: string | null;
  crNumber: string | null;
  maroofId: string | null;
  verificationStatus: VerificationStatus;
  status: OrganizationStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  members: { userId: string; name: string; phone: string; roleName: string; status: string }[];
  recentOrders: { id: string; status: OrderStatus; totalAmountMinor: number; currency: string; createdAt: string }[];
}

export function useAdminOrganizationDetailQuery(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "organization", organizationId],
    queryFn: () => requestJson<AdminOrganizationDetail>(`/api/admin/organizations/${organizationId}`),
    enabled: !!organizationId,
  });
}

export function useSetOrganizationStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, action }: { organizationId: string; action: "suspend" | "reinstate" }) =>
      requestJson<{ ok: true }>(`/api/admin/organizations/${organizationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "organization", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });
}

// --- Disputes ---------------------------------------------------------------

export interface AdminDisputeRow {
  id: string;
  orderId: string;
  reason: string;
  status: DisputeStatus;
  raisedByName: string;
  merchantName: string;
  supplierName: string;
  totalAmountMinor: number;
  currency: string;
  createdAt: string;
}

export function useAdminDisputesQuery() {
  return useQuery({
    queryKey: ["admin", "disputes"],
    queryFn: () => requestJson<AdminDisputeRow[]>("/api/admin/disputes"),
  });
}

export function useResolveDisputeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ disputeId, resolution, notes }: { disputeId: string; resolution: "RESOLVED" | "REJECTED"; notes: string }) =>
      requestJson<{ ok: true }>(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });
}

// --- Reports ------------------------------------------------------------

export interface AdminReports {
  rfqTotal: number;
  orderTotal: number;
  conversionPct: number;
  orderStatusBreakdown: { status: OrderStatus; count: number }[];
  topAttributeValues: { attributeLabelAr: string; valueAr: string; count: number }[];
  supplierLeaderboard: { id: string; legalNameAr: string; ratingAvg: number; ratingCount: number; completedOrders: number }[];
}

export function useAdminReportsQuery() {
  return useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => requestJson<AdminReports>("/api/admin/reports"),
  });
}
