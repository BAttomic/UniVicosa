import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import { isOperator } from "@/modules/events/repositories/event-staff.repository";

// Centralizes the per-event authorization rules shared by server actions,
// pages and the check-in API routes.
//
// Global roles collapsed to "admin" vs everyone else. Event-level roles live in
// the EventStaff collection (operators) plus Event.organizerId (owner).

type MinimalEvent = { organizerId: string };

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError("Voce precisa estar autenticado.");
  }
  return session;
}

export function isAdmin(session: Session | null | undefined): boolean {
  return session?.user?.role === "admin";
}

export function isOwner(event: MinimalEvent, session: Session | null | undefined): boolean {
  return Boolean(session?.user && event.organizerId === session.user.id);
}

// Owner or admin: full management (edit, delete, ticket types, analytics,
// distribute tickets, manage staff).
export function canManageEvent(event: MinimalEvent, session: Session | null | undefined): boolean {
  return isAdmin(session) || isOwner(event, session);
}

// Check-in is available to the admin (via the event manager), the event owner
// and assigned operators. For owner/operator it is also surfaced in the header;
// the admin reaches it only through the event manager (gerenciador de eventos).
export async function canCheckinEvent(
  event: MinimalEvent,
  eventId: string,
  session: Session | null | undefined,
): Promise<boolean> {
  if (!session?.user) return false;
  if (isAdmin(session)) return true;
  if (isOwner(event, session)) return true;
  return isOperator(eventId, session.user.id);
}
