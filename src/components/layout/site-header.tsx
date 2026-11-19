import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { getCurrentProfile } from "@/lib/auth/session";
import { homePathForRole } from "@/types/roles";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  const accountHref = profile ? homePathForRole(profile.role) : "/login";
  const accountLabel = profile ? "حسابي" : "تسجيل الدخول";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Logo />
        <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
          <NavLinks items={mainNav} />
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm" className="hidden h-10 border-border sm:inline-flex">
            <Link href={accountHref}>{accountLabel}</Link>
          </Button>
          <Button asChild size="sm" className="hidden h-10 md:inline-flex">
            <Link href="/design">ابدأ التصميم</Link>
          </Button>
          <MobileNav items={mainNav} accountHref={accountHref} accountLabel={accountLabel} />
        </div>
      </div>
    </header>
  );
}
