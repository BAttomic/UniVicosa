import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

type Role = "buyer" | "organizer" | "operator" | "admin";

export async function requireRole(roles: Role | Role[]) {
  const session = await auth();
  const acceptedRoles = Array.isArray(roles) ? roles : [roles];

  if (!session?.user || !acceptedRoles.includes(session.user.role)) {
    throw new UnauthorizedError("Access denied for this resource");
  }

  return session;
}
