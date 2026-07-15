import { serialize } from "@/lib/serialize";
import Boost from "../models/boost.model";

const B = Boost as unknown as {
  create(data: Record<string, unknown>): Promise<{ _id: { toString(): string } }>;
  find(filter: Record<string, unknown>): any;
};

export async function create(data: Record<string, unknown>) {
  return serialize(await B.create(data)) as unknown as any;
}

export async function findByEventId(eventId: string) {
  return serialize(await B.find({ eventId }).sort({ createdAt: -1 }).lean()) as unknown as any[];
}

export async function findByOrganizerId(organizerId: string) {
  return serialize(await B.find({ organizerId }).sort({ createdAt: -1 }).lean()) as unknown as any[];
}
