import EventStaff, { EventStaffRole, IEventStaff } from "../models/event-staff.model";

const ES = EventStaff as unknown as {
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  findOneAndUpdate(filter: any, update: any, options: any): any;
  deleteOne(filter: Record<string, unknown>): Promise<unknown>;
  deleteMany(filter: Record<string, unknown>): Promise<unknown>;
  exists(filter: Record<string, unknown>): Promise<unknown>;
};

export async function addStaff(data: {
  eventId: string;
  userId: string;
  role?: EventStaffRole;
  addedBy: string;
}): Promise<IEventStaff> {
  const role = data.role ?? EventStaffRole.OPERATOR;
  // Upsert so re-adding the same person is idempotent instead of throwing on the unique index.
  return (await ES.findOneAndUpdate(
    { eventId: data.eventId, userId: data.userId },
    { $set: { role, addedBy: data.addedBy }, $setOnInsert: { createdAt: new Date() } },
    { new: true, upsert: true },
  )) as unknown as IEventStaff;
}

export async function removeStaff(eventId: string, userId: string): Promise<void> {
  await ES.deleteOne({ eventId, userId });
}

export async function removeAllForEvent(eventId: string): Promise<void> {
  await ES.deleteMany({ eventId });
}

export async function findByEventId(eventId: string): Promise<IEventStaff[]> {
  return (await ES.find({ eventId }).sort({ createdAt: -1 }).lean()) as unknown as IEventStaff[];
}

export async function findEventIdsForUser(userId: string): Promise<string[]> {
  const rows = (await ES.find({ userId }).lean()) as unknown as Array<{ eventId: string }>;
  return rows.map((row) => String(row.eventId));
}

export async function isOperator(eventId: string, userId: string): Promise<boolean> {
  return Boolean(await ES.exists({ eventId, userId }));
}
