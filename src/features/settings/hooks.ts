"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Organization } from "@/generated/prisma/client";
import type { ChangePasswordInput, NotificationPreferencesInput, UpdateProfileInput } from "@/lib/validations/settings";

interface ProfileData {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  phoneVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  locale: string;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "حدث خطأ غير متوقع");
  return json.data as T;
}

export function useProfileQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => requestJson<ProfileData>("/api/users/me"),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { update } = useSession();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      requestJson<ProfileData>("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      await update();
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      requestJson<{ ok: true }>("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}

export function useOrganizationQuery(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => requestJson<Organization>(`/api/organizations/${organizationId}`),
    enabled: !!organizationId,
  });
}

export interface NotificationPreferenceRow {
  eventType: string;
  channel: "IN_APP" | "SMS" | "WHATSAPP" | "EMAIL";
  enabled: boolean;
}

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => requestJson<NotificationPreferenceRow[]>("/api/notification-preferences"),
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NotificationPreferencesInput) =>
      requestJson<{ ok: true }>("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
}
