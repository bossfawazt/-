"use client";

import Link from "next/link";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/format";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/hooks";

/** docs/UIUX-touq.md #C.11: bell icon with unread badge -> quick-preview dropdown. */
export function NotificationBell() {
  const { data } = useNotificationsQuery({ limit: 6 });
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" size="icon" className="relative" aria-label="الإشعارات">
          <Bell className="size-4.5" />
          {unreadCount > 0 ? (
            <Badge variant="destructive" className="absolute -end-1 -top-1 h-4.5 min-w-4.5 justify-center rounded-full px-1 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="p-0">الإشعارات</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="size-3.5" /> تحديد الكل كمقروء
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />

        {!data?.items.length ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Inbox className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          <div className="flex max-h-80 flex-col overflow-y-auto">
            {data.items.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                asChild
                className="flex-col items-start gap-0.5 whitespace-normal"
                onSelect={() => {
                  if (notification.status !== "READ") markRead.mutate(notification.id);
                }}
              >
                <Link href={notification.linkUrl ?? "/notifications"}>
                  <div className="flex w-full items-center gap-2">
                    {notification.status !== "READ" ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
                    <span className={notification.status !== "READ" ? "font-semibold" : "font-medium"}>
                      {notification.title}
                    </span>
                  </div>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</span>
                  <span className="text-[11px] text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm font-medium text-primary">
            عرض الكل
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
