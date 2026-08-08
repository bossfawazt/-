"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BusinessDetailsInput, OtpSendInput, RegisterInput } from "@/lib/validations/auth";

interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message ?? "حدث خطأ غير متوقع");
  }
  return json.data as TResponse;
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: RegisterInput) => postJson<{ userId: string }>("/api/auth/register", input),
  });
}

export function useSendOtpMutation() {
  return useMutation({
    mutationFn: (input: OtpSendInput) => postJson<{ retryAfterSeconds: number }>("/api/auth/otp/send", input),
  });
}

export interface RegionOption {
  id: string;
  nameAr: string;
  nameEn: string;
}

export function useRegionsQuery() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const res = await fetch("/api/regions");
      const json = await res.json();
      return json.data as RegionOption[];
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useUpdateOrganizationMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BusinessDetailsInput) => {
      const res = await fetch(`/api/organizations/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "تعذر حفظ البيانات");
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organization", organizationId] }),
  });
}
