import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { KitchenIllustration } from "@/components/illustrations/kitchen-illustration";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            العودة للرئيسية
          </Link>
        </div>
        <main id="main" className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          {children}
        </main>
        <p className="text-center text-xs text-muted-foreground">
          {siteConfig.name} — {siteConfig.tagline}
        </p>
      </div>
      <div className="relative hidden items-center overflow-hidden bg-[var(--ivory-deep)] p-12 lg:flex">
        <div className="w-full overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-xl">
          <KitchenIllustration style="neo_classic" cabinetColor="#F1ECE2" countertop="marble" wallColor="#E8E0D2" title="رسم توضيحي لمطبخ نيو كلاسيك" />
        </div>
      </div>
    </div>
  );
}
