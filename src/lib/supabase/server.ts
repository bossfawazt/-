import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * عميل Supabase في الخادم بجلسة المستخدم الحالي (يخضع لـ RLS).
 * يُنشأ عميل جديد لكل طلب.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // يُستدعى من Server Component حيث لا يمكن كتابة الكوكيز؛ الـ proxy يتولى تحديث الجلسة.
        }
      },
    },
  });
}
