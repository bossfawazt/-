"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateDisputeInput, CreateReviewInput, OrderStatusActionInput } from "@/lib/validations/rfq";
import type { OrderDetailData } from "@/features/orders/types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "حدث خطأ غير متوقع");
  return json.data as T;
}

export function useOrdersQuery() {
  return useQuery({ queryKey: ["orders"], queryFn: () => fetchJson("/api/orders") });
}

export function useOrderQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchJson<OrderDetailData>(`/api/orders/${orderId}`),
    enabled: !!orderId,
  });
}

export function useOrderStatusMutation(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderStatusActionInput) =>
      fetchJson(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useLeaveReviewMutation(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) =>
      fetchJson(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useRaiseDisputeMutation(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDisputeInput) =>
      fetchJson(`/api/orders/${orderId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
