import { serialize } from "@/lib/serialize";
import Order from "../models/order.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import Event from "@/modules/events/models/event.model";
import Ticket from "@/modules/tickets/models/ticket.model";

const O = Order as unknown as {
  create(data: any): Promise<any>;
  findById(id: string): any;
  find(filter: Record<string, unknown>): any;
  findByIdAndUpdate(id: string, data: any, options: any): any;
  findOneAndUpdate(filter: any, update: any, options: any): any;
};

const TT = TicketType as unknown as { find(filter: Record<string, unknown>): any };
const Ev = Event as unknown as { findById(id: string): any };
const Tk = Ticket as unknown as { find(filter: Record<string, unknown>): any };

export async function create(data: any) {
  return (await O.create(data)) as unknown as any;
}

export async function findById(id: string) {
  return serialize(await O.findById(id).lean()) as unknown as any;
}

export async function findByBuyerId(buyerId: string) {
  return serialize(await O.find({ buyerId }).sort({ createdAt: -1 }).lean()) as unknown as any[];
}

// Filtered order history: status + creation date range applied at the DB level.
// Free-text search (event/order/method) is applied in the page after the event
// titles are resolved.
export async function findByBuyerFiltered(
  buyerId: string,
  options: { status?: string; from?: Date; to?: Date },
) {
  const filter: Record<string, unknown> = { buyerId };
  if (options.status) filter.status = options.status;
  if (options.from || options.to) {
    const range: Record<string, Date> = {};
    if (options.from) range.$gte = options.from;
    if (options.to) range.$lte = options.to;
    filter.createdAt = range;
  }
  return serialize(await O.find(filter).sort({ createdAt: -1 }).lean()) as unknown as any[];
}

export async function findExpired() {
  return serialize(await O.find({ status: "pending", expiresAt: { $lte: new Date() } }).lean()) as unknown as any[];
}

export async function expire(id: string) {
  return serialize(
    await O.findOneAndUpdate({ _id: id, status: "pending" }, { status: "expired" }, { new: true }).lean(),
  ) as unknown as any;
}

// Enriched view for the order detail page: joins the event title, each item's
// ticket-type name and subtotal, and the tickets that were generated once paid.
export async function findDetailById(id: string) {
  const order = await O.findById(id).lean();
  if (!order) return null;

  const event = await Ev.findById(String(order.eventId)).lean();
  const ticketTypeIds = (order.items ?? []).map((item: any) => String(item.ticketTypeId));
  const ticketTypes = ticketTypeIds.length ? await TT.find({ _id: { $in: ticketTypeIds } }).lean() : [];
  const nameByType = new Map<string, string>(ticketTypes.map((type: any) => [String(type._id), type.name]));

  const tickets = await Tk.find({ orderId: String(order._id) }).lean();

  return serialize({
    ...order,
    eventTitle: event?.title ?? "Evento",
    eventSlug: event?.slug ?? null,
    items: (order.items ?? []).map((item: any) => ({
      ...item,
      ticketTypeName: nameByType.get(String(item.ticketTypeId)) ?? "Ingresso",
      eventName: event?.title ?? "Evento",
      subtotal: Number(item.unitPrice) * Number(item.quantity),
    })),
    tickets,
  }) as unknown as any;
}
