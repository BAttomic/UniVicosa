import Ticket from "../models/ticket.model";
import Order from "@/modules/orders/models/order.model";
import Event from "@/modules/events/models/event.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import Lot from "@/modules/events/models/lot.model";
import { customAlphabet } from "nanoid";
import crypto from "crypto";
import { env } from "@/lib/env";

const nanoid = customAlphabet("1234567890abcdef", 32);

const T = Ticket as unknown as {
  create(data: any): Promise<any>;
  findById(id: string): any;
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  findByIdAndUpdate(id: string, data: any, options: any): any;
  findOneAndUpdate(filter: any, update: any, options: any): any;
};

const OrderModel = Order as unknown as { find(filter: Record<string, unknown>): any };
const EventModel = Event as unknown as { find(filter: Record<string, unknown>): any };
const TicketTypeModel = TicketType as unknown as { find(filter: Record<string, unknown>): any };
const LotModel = Lot as unknown as { find(filter: Record<string, unknown>): any };

export type DetailedTicket = {
  id: string;
  code: string;
  status: string;
  usedAt: Date | null;
  eventTitle: string;
  eventSlug: string | null;
  eventStartsAt: Date | null;
  eventEndsAt: Date | null;
  venue: string | null;
  ticketTypeName: string;
  lotName: string | null;
  unitPrice: number;
  purchaseDate: Date | null;
  paidAt: Date | null;
  isCourtesy: boolean;
  payerName: string | null;
  payerCpf: string | null;
};

export function generateCode(): string {
  return nanoid();
}

export function generateSecret(ticketId: string, ownerId: string): string {
  const windowSeconds = 30;
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  return crypto.createHmac("sha256", env.TICKET_HMAC_SECRET).update(`${ticketId}:${ownerId}:${window}`).digest("hex");
}

export async function create(data: any) {
  return (await T.create(data)) as unknown as any;
}

export async function findById(id: string) {
  return (await T.findById(id).lean()) as unknown as any;
}

export async function findByCode(code: string) {
  return (await T.findOne({ code }).lean()) as unknown as any;
}

export async function findByOwnerId(ownerId: string) {
  return (await T.find({ ownerId }).sort({ createdAt: -1 }).lean()) as unknown as any[];
}

// Carteira detalhada do comprador: junta dados do pedido (titular, CPF, datas e
// valor), do tipo de ingresso, do lote e do evento — em consultas em lote.
export async function findDetailedByOwnerId(ownerId: string): Promise<DetailedTicket[]> {
  const tickets = (await T.find({ ownerId }).sort({ createdAt: -1 }).lean()) as any[];
  if (tickets.length === 0) return [];

  const orderIds = [...new Set(tickets.map((ticket) => String(ticket.orderId)))];
  const eventIds = [...new Set(tickets.map((ticket) => String(ticket.eventId)))];
  const ticketTypeIds = [...new Set(tickets.map((ticket) => String(ticket.ticketTypeId)))];

  const [orders, events, ticketTypes] = await Promise.all([
    OrderModel.find({ _id: { $in: orderIds } }).lean(),
    EventModel.find({ _id: { $in: eventIds } }).lean(),
    TicketTypeModel.find({ _id: { $in: ticketTypeIds } }).lean(),
  ]);

  const orderMap = new Map<string, any>((orders as any[]).map((order) => [String(order._id), order]));
  const eventMap = new Map<string, any>((events as any[]).map((event) => [String(event._id), event]));
  const ttMap = new Map<string, any>((ticketTypes as any[]).map((type) => [String(type._id), type]));

  const lotIds = new Set<string>();
  for (const order of orders as any[]) {
    for (const item of order.items ?? []) {
      if (item.lotId) lotIds.add(String(item.lotId));
    }
  }
  const lots = lotIds.size ? ((await LotModel.find({ _id: { $in: [...lotIds] } }).lean()) as any[]) : [];
  const lotMap = new Map<string, any>(lots.map((lot) => [String(lot._id), lot]));

  return tickets.map((ticket) => {
    const order = orderMap.get(String(ticket.orderId));
    const items = (order?.items ?? []) as any[];
    const item = items.find((entry) => String(entry.ticketTypeId) === String(ticket.ticketTypeId)) ?? items[0] ?? {};
    const lot = item?.lotId ? lotMap.get(String(item.lotId)) : undefined;
    const ticketType = ttMap.get(String(ticket.ticketTypeId));
    const event = eventMap.get(String(ticket.eventId));
    const isCourtesy = typeof order?.paymentIntentId === "string" && order.paymentIntentId.startsWith("comp_");

    return {
      id: String(ticket._id),
      code: ticket.code,
      status: ticket.status,
      usedAt: ticket.usedAt ?? null,
      eventTitle: event?.title ?? "Evento",
      eventSlug: event?.slug ?? null,
      eventStartsAt: event?.startsAt ?? null,
      eventEndsAt: event?.endsAt ?? null,
      venue: event?.venue ? `${event.venue.name} — ${event.venue.city}/${event.venue.state}` : null,
      ticketTypeName: ticketType?.name ?? "Ingresso",
      lotName: lot?.name ?? null,
      unitPrice: Number(item?.unitPrice ?? 0),
      purchaseDate: order?.createdAt ?? null,
      paidAt: order?.paidAt ?? null,
      isCourtesy,
      payerName: order?.payer?.name ?? null,
      payerCpf: order?.payer?.cpf ?? null,
    };
  });
}

export async function findByEventId(eventId: string) {
  return (await T.find({ eventId }).lean()) as unknown as any[];
}

export async function markUsed(ticketId: string, operatorId: string) {
  return (
    await T.findOneAndUpdate(
      { _id: ticketId, status: "valid" },
      { status: "used", usedAt: new Date(), usedBy: operatorId },
      { new: true },
    )
  ) as unknown as any;
}

export async function cancel(ticketId: string) {
  return (await T.findByIdAndUpdate(ticketId, { status: "cancelled" }, { new: true }).lean()) as unknown as any;
}
