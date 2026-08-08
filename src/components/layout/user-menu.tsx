"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Building2, LifeBuoy, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

/** docs/UIUX-touq.md #B.3 profile/org menu. */
export function UserMenu() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" size="icon" className="rounded-full" aria-label="حسابي">
          <Avatar className="size-9">
            <AvatarFallback>{initials(session.user.name ?? "؟")}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-semibold">{session.user.name}</span>
          {session.user.organization ? (
            <span className="text-xs font-normal text-muted-foreground">{session.user.organization.legalNameAr}</span>
          ) : (
            <span className="text-xs font-normal text-muted-foreground">فريق توق</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <UserIcon /> إعدادات الحساب
          </Link>
        </DropdownMenuItem>
        {session.user.organization ? (
          <DropdownMenuItem asChild>
            <Link href="/settings?tab=organization">
              <Building2 /> إعدادات المنشأة
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> الإعدادات
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="mailto:support@touq.sa">
            <LifeBuoy /> الدعم
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => signOut({ callbackUrl: "/" })}>
          <LogOut /> تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
