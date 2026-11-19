import "server-only";

import { createClient } from "@/lib/supabase/server";

/** مؤشرات لوحة الإدارة — تُقرأ بجلسة المستخدم فتخضع لـ RLS حسب الدور */
export async function getAdminOverview() {
  const supabase = await createClient();
  const now = Date.now();
  const since = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date(now).toISOString().slice(0, 10);
  const head = { count: "exact" as const, head: true };

  const [customers, newProjects, activeOrders, completedOrders, upcoming, openComplaints, messages] = await Promise.all([
    supabase.from("profiles").select("id", head).eq("role", "customer"),
    supabase.from("projects").select("id", head).gte("created_at", since).is("deleted_at", null),
    supabase.from("orders").select("id", head).not("status", "in", "(completed,cancelled)"),
    supabase.from("orders").select("id", head).eq("status", "completed"),
    supabase.from("appointments").select("id", head).gte("requested_date", today).in("status", ["new", "confirmed"]),
    supabase.from("complaints").select("id", head).in("status", ["open", "in_progress"]),
    supabase.from("contact_messages").select("id", head).is("handled_at", null),
  ]);

  return {
    customers: customers.count ?? 0,
    newProjects: newProjects.count ?? 0,
    activeOrders: activeOrders.count ?? 0,
    completedOrders: completedOrders.count ?? 0,
    upcomingAppointments: upcoming.count ?? 0,
    openComplaints: openComplaints.count ?? 0,
    newMessages: messages.count ?? 0,
  };
}
