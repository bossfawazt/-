// Full Admin Dashboard built in Phase 11 (docs/UIUX-touq.md #C.6).
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user.platformRole) redirect("/");

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">لوحة الإدارة</h1>
      <p className="mt-2 text-muted-foreground">قيد الإنشاء (Phase 11)</p>
    </main>
  );
}
