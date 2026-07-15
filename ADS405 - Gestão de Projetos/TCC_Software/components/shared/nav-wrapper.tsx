import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findByOrganizerId } from "@/modules/events/repositories/event.repository";
import { findEventIdsForUser } from "@/modules/events/repositories/event-staff.repository";
import { Nav } from "./nav";
import { PublicNav } from "./public-nav";

export async function NavWrapper() {
  const session = await auth();
  if (!session?.user) return <PublicNav />;

  const isAdmin = session.user.role === "admin";

  // Check-in no header: apenas organizador (dono) e operador. O admin pode
  // validar qualquer evento, mas pelo gerenciador de eventos (sem atalho aqui),
  // pois seu papel é a gestão da plataforma, não a operação de portaria.
  let canCheckin = false;
  if (!isAdmin) {
    try {
      await connectDB();
      const [owned, operatorEventIds] = await Promise.all([
        findByOrganizerId(session.user.id),
        findEventIdsForUser(session.user.id),
      ]);
      canCheckin = owned.length > 0 || operatorEventIds.length > 0;
    } catch {
      canCheckin = false;
    }
  }

  return (
    <Nav
      isAdmin={isAdmin}
      canCheckin={canCheckin}
      name={session.user.name ?? session.user.email ?? ""}
    />
  );
}
