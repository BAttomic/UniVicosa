import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { LoginSchema } from "@/modules/identity/schemas/user.schema";
import { findByEmail } from "@/modules/identity/repositories/user.repository";
import { consumeRateLimit } from "@/lib/rate-limit";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase().trim();
        const ip = request?.headers?.get("x-forwarded-for") ?? "local";
        const allowed = consumeRateLimit(`${ip}:${email}`, {
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000,
        });

        if (!allowed) {
          return null;
        }

        await connectDB();
        const user = await findByEmail(email);
        if (!user) {
          return null;
        }

        const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!matches) {
          return null;
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
