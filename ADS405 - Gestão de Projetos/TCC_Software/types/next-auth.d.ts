import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "buyer" | "organizer" | "operator" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "buyer" | "organizer" | "operator" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "buyer" | "organizer" | "operator" | "admin";
  }
}