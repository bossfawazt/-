import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { updateProfileSchema } from "@/lib/validations/settings";

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  phoneVerifiedAt: true,
  emailVerifiedAt: true,
  locale: true,
} as const;

/** docs/UIUX-touq.md #C.13: Settings > Profile. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: PROFILE_SELECT });
  if (!user) return apiError("not_found", "المستخدم غير موجود", 404);
  return apiOk(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const email = parsed.data.email || null;
  if (email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.user.id) {
      return apiError("conflict", "البريد الإلكتروني مستخدم بالفعل", 409);
    }
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, email },
    select: PROFILE_SELECT,
  });

  return apiOk(user);
}
