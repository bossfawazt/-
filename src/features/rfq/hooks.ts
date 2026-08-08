"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateQuoteInput, CreateRfqInput } from "@/lib/validations/rfq";
import type { RfqDetailData } from "@/features/rfq/types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "حدث خطأ غير متوقع");
  return json.data as T;
}

export function useRfqsQuery() {
  return useQuery({ queryKey: ["rfqs"], queryFn: () => fetchJson("/api/rfqs") });
}

export function useRfqQuery(rfqId: string | undefined) {
  return useQuery({
    queryKey: ["rfq", rfqId],
    queryFn: () => fetchJson<RfqDetailData>(`/api/rfqs/${rfqId}`),
    enabled: !!rfqId,
    refetchInterval: 15_000,
  });
}

export function useCreateRfqMutation() {
  return useMutation({
    mutationFn: (input: CreateRfqInput) =>
      fetchJson("/api/rfqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
  });
}

export function useSendMessageMutation(rfqId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      fetchJson(`/api/rfqs/${rfqId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rfq", rfqId] }),
  });
}

export function useCreateQuoteMutation(rfqId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteInput) =>
      fetchJson(`/api/rfqs/${rfqId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfq", rfqId] });
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
    },
  });
}

export function useQuoteActionMutation(rfqId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, action }: { quoteId: string; action: "accept" | "decline" }) =>
      fetchJson<{ id: string }>(`/api/quotes/${quoteId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfq", rfqId] });
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
