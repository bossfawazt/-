import { z } from "zod";

/** docs/UIUX-touq.md #C.13: Settings > Profile. */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا").max(100),
  email: z.email("بريد إلكتروني غير صحيح").trim().max(150).optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** docs/UIUX-touq.md #C.13: Settings > Security > change password. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
    newPassword: z.string().min(8, "كلمة المرور الجديدة 8 أحرف على الأقل"),
    confirmPassword: z.string().min(8, "تأكيد كلمة المرور 8 أحرف على الأقل"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const notificationChannelSchema = z.enum(["IN_APP", "SMS", "WHATSAPP", "EMAIL"]);

/** docs/UIUX-touq.md #C.13: Settings > Notifications preference matrix. */
export const notificationPreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      eventType: z.string().min(1),
      channel: notificationChannelSchema,
      enabled: z.boolean(),
    }),
  ),
});
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
