import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { changePasswordSchema } from "@/lib/validations/settings";

/** docs/UIUX-touq.md #C.13: Settings > Security > change password. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("unauthorized", "يجب تسجيل الدخول", 401);

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return apiError("not_found", "المستخدم غير موجود", 404);

  if (user.passwordHash) {
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return apiError("invalid_credentials", "كلمة المرور الحالية غير صحيحة", 401);
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({ where: { id: session.user.id }, data: { passwordHash } });

  return apiOk({ ok: true });
}
