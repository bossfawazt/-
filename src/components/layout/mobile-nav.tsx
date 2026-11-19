"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig, type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import { isActivePath } from "./nav-links";

export function MobileNav({ items, accountHref, accountLabel }: { items: NavItem[]; accountHref: string; accountLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="icon" size="icon" className="size-11 lg:hidden" aria-label="فتح القائمة">
          <Menu className="!size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="start" className="flex w-[86vw] max-w-sm flex-col gap-6 bg-background p-6">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <div>
            <SheetTitle className="text-lg font-bold">{siteConfig.name}</SheetTitle>
            <SheetDescription className="text-xs">{siteConfig.tagline}</SheetDescription>
          </div>
        </div>
        <nav aria-label="القائمة الرئيسية">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-foreground/80 hover:bg-secondary",
                        active && "bg-secondary text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <SheetClose asChild>
            <Button asChild size="lg" className="w-full">
              <Link href="/design">ابدأ تصميم مطبخك</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild variant="secondary" size="lg" className="w-full border-border">
              <Link href={accountHref}>{accountLabel}</Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
