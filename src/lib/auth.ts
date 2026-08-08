import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { loadAuthContext } from "@/lib/session";
import { passwordLoginSchema, otpVerifySchema } from "@/lib/validations/auth";

/**
 * Auth.js v5 config. Two Credentials providers (password, otp) rather than
 * OAuth — the platform's primary identity is phone+OTP
 * (docs/UIUX-touq.md #C.12), with a password fallback for return visits.
 * No adapter is used: sessions are JWT-only, and Users/Organizations are
 * our own domain tables (prisma/schema.prisma), not the Auth.js adapter
 * schema — OAuth (e.g. future "Sign in with Salla") can be layered on
 * later without changing this shape (docs/ARCHITECTURE-touq.md #9.1).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "password",
      name: "Password",
      credentials: { phone: { label: "Phone" }, password: { label: "Password", type: "password" } },
      async authorize(raw) {
        const parsed = passwordLoginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { phone, password } = parsed.data;

        const user = await db.user.findUnique({ where: { phone } });
        if (!user?.passwordHash || user.status !== "ACTIVE") return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { id: user.id, name: user.name, phone: user.phone };
      },
    }),
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        phone: { label: "Phone" },
        code: { label: "Code" },
        purpose: { label: "Purpose" },
      },
      async authorize(raw) {
        const parsed = otpVerifySchema.safeParse(raw);
        if (!parsed.success) return null;
        const { phone, code, purpose } = parsed.data;

        const result = await verifyOtp(phone, purpose, code);
        if (!result.ok) return null;

        const user = await db.user.findUnique({ where: { phone } });
        if (!user || user.status !== "ACTIVE") return null;

        const updates: { phoneVerifiedAt?: Date; lastLoginAt: Date } = { lastLoginAt: new Date() };
        if (purpose === "REGISTER" && !user.phoneVerifiedAt) {
          updates.phoneVerifiedAt = new Date();
        }
        await db.user.update({ where: { id: user.id }, data: updates });

        return { id: user.id, name: user.name, phone: user.phone };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.userId = user.id;
      }
      if (user || trigger === "update" || !token.loaded) {
        const context = await loadAuthContext(token.userId as string);
        token.phone = context.phone;
        token.locale = context.locale;
        token.platformRole = context.platformRole;
        token.organization = context.organization;
        token.loaded = true;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.phone = token.phone;
      session.user.locale = token.locale;
      session.user.platformRole = token.platformRole;
      session.user.organization = token.organization;
      return session;
    },
  },
});
