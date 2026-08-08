"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileText,
  Inbox,
  MessageSquare,
  MoreVertical,
  Package,
  Receipt,
  Star,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NotificationEvent } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { notificationGroup } from "@/config/notifications";
import {
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/hooks";

const EVENT_ICONS: Record<string, LucideIcon> = {
  "rfq.created": FileText,
  "rfq.message": MessageSquare,
  "quote.created": Receipt,
  "quote.accepted": Receipt,
  "quote.declined": Receipt,
  "order.status_changed": Package,
  "review.created": Star,
};

type FilterTab = "all" | "unread" | "orders" | "system";

function dateGroupOf(date: Date): "today" | "yesterday" | "week" | "earlier" {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  if (date >= startOfWeek) return "week";
  return "earlier";
}

const GROUP_LABELS: Record<string, string> = {
  today: "اليوم",
  yesterday: "الأمس",
  week: "هذا الأسبوع",
  earlier: "سابقًا",
};

/** docs/UIUX-touq.md #C.11: full Notifications page — grouped by date, filterable, mark-all-read, per-item overflow menu. */
export function NotificationList() {
  const [tab, setTab] = React.useState<FilterTab>("all");
  const { data, isLoading } = useNotificationsQuery({ limit: 100 });
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const deleteNotification = useDeleteNotificationMutation();

  const items = (data?.items ?? []).filter((item) => {
    if (tab === "unread") return item.status !== "READ";
    if (tab === "orders") return notificationGroup(item.eventType) === "orders";
    if (tab === "system") return notificationGroup(item.eventType) === "system";
    return true;
  });

  const groups: Record<string, NotificationEvent[]> = { today: [], yesterday: [], week: [], earlier: [] };
  for (const item of items) {
    groups[dateGroupOf(new Date(item.createdAt))].push(item);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">الإشعارات</h1>
        {data && data.unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <CheckCheck className="size-4" /> تحديد الكل كمقروء
          </button>
        ) : null}
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as FilterTab)}>
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="unread">غير مقروءة</TabsTrigger>
          <TabsTrigger value="orders">الطلبات والعروض</TabsTrigger>
          <TabsTrigger value="system">الحساب والنظام</TabsTrigger>
        </TabsList>
      </Tabs>

      {!items.length ? (
        <div className="pt-8">
          <EmptyState icon={Inbox} title="لا توجد إشعارات جديدة" description="ستظهر هنا إشعارات طلبات الشراء والعروض والطلبات." />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {(["today", "yesterday", "week", "earlier"] as const)
            .filter((key) => groups[key].length)
            .map((key) => (
              <div key={key} className="flex flex-col gap-1.5">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {GROUP_LABELS[key]}
                </h2>
                {groups[key].map((notification) => {
                  const Icon = EVENT_ICONS[notification.eventType] ?? Bell;
                  const unread = notification.status !== "READ";
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                        unread ? "bg-primary/5" : "bg-card",
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <Link
                        href={notification.linkUrl ?? "/notifications"}
                        className="min-w-0 flex-1"
                        onClick={() => {
                          if (unread) markRead.mutate(notification.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {unread ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
                          <span className={cn("truncate text-sm", unread ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                            {notification.title}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
                        <span className="text-[11px] text-muted-foreground" title={formatDate(notification.createdAt)}>
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="icon" size="icon" className="size-7 shrink-0" aria-label="خيارات إضافية">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {unread ? (
                            <DropdownMenuItem onSelect={() => markRead.mutate(notification.id)}>
                              <CheckCheck className="size-4" /> تحديد كمقروء
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            destructive
                            onSelect={() => deleteNotification.mutate(notification.id)}
                          >
                            <Trash2 className="size-4" /> حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
