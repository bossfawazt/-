"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NOTIFICATION_CHANNELS, NOTIFICATION_EVENT_TYPES } from "@/config/notifications";
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  type NotificationPreferenceRow,
} from "@/features/settings/hooks";

function keyOf(eventType: string, channel: string) {
  return `${eventType}:${channel}`;
}

/** docs/UIUX-touq.md #C.13: Settings > Notifications — event type x channel toggle matrix. */
export function NotificationsTab() {
  const { data, isLoading } = useNotificationPreferencesQuery();
  const updatePreferences = useUpdateNotificationPreferencesMutation();
  const [overrides, setOverrides] = React.useState<Map<string, boolean>>(new Map());

  const rows = new Map<string, NotificationPreferenceRow>();
  for (const row of data ?? []) rows.set(keyOf(row.eventType, row.channel), row);

  function isEnabled(eventType: string, channel: string) {
    const key = keyOf(eventType, channel);
    if (overrides.has(key)) return overrides.get(key)!;
    return rows.get(key)?.enabled ?? channel === "IN_APP";
  }

  function toggle(eventType: string, channel: string) {
    const key = keyOf(eventType, channel);
    setOverrides((prev) => {
      const next = new Map(prev);
      next.set(key, !isEnabled(eventType, channel));
      return next;
    });
  }

  async function handleSave() {
    const preferences = NOTIFICATION_EVENT_TYPES.flatMap((event) =>
      NOTIFICATION_CHANNELS.map((channel) => ({
        eventType: event.key,
        channel: channel.key,
        enabled: isEnabled(event.key, channel.key),
      })),
    );
    try {
      await updatePreferences.mutateAsync({ preferences });
      setOverrides(new Map());
      toast.success("تم حفظ تفضيلات الإشعارات");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ التفضيلات");
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تفضيلات الإشعارات</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع الحدث</TableHead>
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <TableHead key={channel.key} className="text-center">
                    {channel.labelAr}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {NOTIFICATION_EVENT_TYPES.map((event) => (
                <TableRow key={event.key}>
                  <TableCell className="font-medium text-foreground">{event.labelAr}</TableCell>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <TableCell key={channel.key} className="text-center">
                      <Switch
                        checked={isEnabled(event.key, channel.key)}
                        onCheckedChange={() => toggle(event.key, channel.key)}
                        disabled={channel.key !== "IN_APP"}
                        aria-label={`${event.labelAr} - ${channel.labelAr}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">
          قنوات الرسائل النصية وواتساب والبريد الإلكتروني قيد التفعيل قريبًا؛ الإشعارات داخل التطبيق فعّالة الآن.
        </p>
        <Button type="button" className="w-fit" onClick={handleSave} loading={updatePreferences.isPending}>
          حفظ التفضيلات
        </Button>
      </CardContent>
    </Card>
  );
}
