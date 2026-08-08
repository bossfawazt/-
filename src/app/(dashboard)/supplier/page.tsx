// Full Supplier Dashboard built in Phase 5 (shell) + later phases (docs/UIUX-touq.md #C.5).
import { auth } from "@/lib/auth";

export default async function SupplierDashboardPage() {
  const session = await auth();
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">مرحباً بعودتك، {session?.user.name}</h1>
      <p className="mt-2 text-muted-foreground">لوحة المورد — قيد الإنشاء (Phase 5+)</p>
    </main>
  );
}
