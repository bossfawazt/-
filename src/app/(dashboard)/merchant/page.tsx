// Full Merchant Dashboard built in Phase 5 (shell) + later phases (docs/UIUX-touq.md #C.4).
import { auth } from "@/lib/auth";

export default async function MerchantDashboardPage() {
  const session = await auth();
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">مرحباً بعودتك، {session?.user.name}</h1>
      <p className="mt-2 text-muted-foreground">لوحة التاجر — قيد الإنشاء (Phase 5+)</p>
    </main>
  );
}
