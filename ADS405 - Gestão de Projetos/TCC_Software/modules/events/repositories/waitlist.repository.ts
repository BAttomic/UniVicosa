import { serialize } from "@/lib/serialize";
import Waitlist from "../models/waitlist.model";

const W = Waitlist as unknown as {
  create(data: any): Promise<any>;
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  findOneAndUpdate(filter: any, update: any, options: any): any;
  countDocuments(filter: Record<string, unknown>): Promise<number>;
};

async function rank(eventId: string, createdAt: Date) {
  // Posição FIFO: ordem de chegada (createdAt). Como o createdAt só é definido na
  // inserção, a posição da conta permanece estável entre visitas.
  const [position, total] = await Promise.all([
    W.countDocuments({ eventId, createdAt: { $lte: createdAt } }),
    W.countDocuments({ eventId }),
  ]);
  return { position, total };
}

// Fila FIFO por conta: uma inscrição por usuário logado. Reaproveita uma inscrição
// anterior da mesma conta OU do mesmo e-mail (evita conflito com a inscrição
// antiga sem conta) e carimba o userId, preservando a posição de chegada.
export async function joinByAccount(data: { eventId: string; userId: string; name: string; email: string; phone?: string }) {
  const email = data.email.toLowerCase();
  const existing = await W.findOne({ eventId: data.eventId, $or: [{ userId: data.userId }, { email }] })
    .sort({ createdAt: 1 })
    .lean();

  let entry;
  if (existing) {
    entry = await W.findOneAndUpdate(
      { _id: existing._id },
      { $set: { userId: data.userId, name: data.name, email, phone: data.phone } },
      { new: true },
    ).lean();
  } else {
    const created = await W.create({ eventId: data.eventId, userId: data.userId, name: data.name, email, phone: data.phone, status: "waiting" });
    entry = created.toObject ? created.toObject() : created;
  }

  const { position, total } = await rank(data.eventId, entry.createdAt);
  return { entry: serialize(entry), position, total };
}

// Posição atual da conta logada na fila do evento (ou null se não estiver na fila).
export async function getAccountPosition(eventId: string, userId: string) {
  const entry = await W.findOne({ eventId, userId }).lean();
  if (!entry) return null;
  const { position, total } = await rank(eventId, entry.createdAt);
  return { position, total, status: entry.status as string };
}

export async function countByEvent(eventId: string): Promise<number> {
  return W.countDocuments({ eventId });
}

export async function findByEvent(eventId: string) {
  return serialize(await W.find({ eventId }).sort({ createdAt: 1 }).lean()) as unknown as any[];
}

export async function isOnWaitlist(eventId: string, email: string): Promise<boolean> {
  const existing = await W.findOne({ eventId, email: email.toLowerCase() }).lean();
  return Boolean(existing);
}
