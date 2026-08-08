"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationEvent } from "@/generated/prisma/client";

interface NotificationsResponse {
  items: NotificationEvent[];
  unreadCount: number;
}

export function useNotificationsQuery(options?: { limit?: number; unreadOnly?: boolean; enabled?: boolean }) {
  const { limit = 8, unreadOnly = false, enabled = true } = options ?? {};
  return useQuery({
    queryKey: ["notifications", { limit, unreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), unread: String(unreadOnly) });
      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error("تعذر تحميل الإشعارات");
      const json = await res.json();
      return json.data as NotificationsResponse;
    },
    enabled,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
      if (!res.ok) throw new Error("تعذر تحديث الإشعار");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (!res.ok) throw new Error("تعذر تحديث الإشعارات");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("تعذر حذف الإشعار");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
