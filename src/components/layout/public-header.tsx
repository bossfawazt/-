"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { publicNav } from "@/config/site";
import { cn } from "@/lib/utils";

/** docs/UIUX-touq.md #B.1: sticky public header. */
export function PublicHeader() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const dashboardHref = session?.user.platformRole
    ? "/admin"
    : session?.user.organization?.type === "SUPPLIER"
      ? "/supplier"
      : "/merchant";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-xl font-bold text-foreground">
            توق
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/marketplace" className="me-1 text-muted-foreground hover:text-foreground" aria-label="بحث">
            <Search className="size-4.5" />
          </Link>
          <LanguageToggle />

          {status === "authenticated" ? (
            <>
              <NotificationBell />
              <Button asChild variant="secondary" size="sm">
                <Link href={dashboardHref}>لوحتي</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button asChild variant="tertiary" size="sm">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/register">انضم كمورد</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/marketplace">تصفح كتاجر</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="icon" size="icon" aria-label="القائمة">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="start" className="w-full max-w-xs">
            <SheetHeader>
              <SheetTitle className="font-display">توق</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1">
              {publicNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className={cn("mt-auto flex flex-col gap-2 border-t border-border pt-4")}>
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-muted-foreground">اللغة</span>
                <LanguageToggle />
              </div>
              {status === "authenticated" ? (
                <Button asChild onClick={() => setMobileOpen(false)}>
                  <Link href={dashboardHref}>لوحتي</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="secondary" onClick={() => setMobileOpen(false)}>
                    <Link href="/login">تسجيل الدخول</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/register">انضم كمورد</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
