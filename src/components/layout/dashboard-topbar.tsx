import { LanguageToggle } from "@/components/layout/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";

/** docs/UIUX-touq.md #B.3 top bar: contextual title/breadcrumb, bell, profile menu. */
export function DashboardTopbar({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-1.5">
        <LanguageToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
