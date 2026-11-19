import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="container-page flex min-h-dvh flex-col items-center justify-center gap-6 text-center">
      <Logo />
      <h1 className="text-3xl font-bold">الصفحة غير موجودة</h1>
      <p className="text-muted-foreground">ربما نُقلت الصفحة أو أن الرابط غير صحيح.</p>
      <Button asChild size="lg">
        <Link href="/">العودة للرئيسية</Link>
      </Button>
    </main>
  );
}
