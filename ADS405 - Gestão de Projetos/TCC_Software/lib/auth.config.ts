import type { NextAuthConfig, DefaultSession } from "next-auth";
import { env } from "@/lib/env";

type AppRole = "buyer" | "organizer" | "operator" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  trustHost: true,
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 },
  jwt: { maxAge: 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as { id?: string }).id;
        token.role = (user as { role?: AppRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
        session.user.role = (token.role as AppRole) ?? "buyer";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
