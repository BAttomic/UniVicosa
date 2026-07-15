"use server";

import crypto from "crypto";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { priceBreakdown } from "@/lib/fees";
import { isValidCpf } from "@/lib/br-validators";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { redirect } from "next/navigation";
import { EventStatus } from "@/modules/events/models/event.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import Lot from "@/modules/events/models/lot.model";
import { create as createEvent, deleteById as deleteEventById, findById, findBySlug, update as updateEvent, generateSlug } from "@/modules/events/repositories/event.repository";
import { incrementSoldQuantity } from "@/modules/events/repositories/ticket-type.repository";
import { recordAuditLog } from "@/lib/audit";
import { removeAllForEvent as removeEventStaff } from "@/modules/events/repositories/event-staff.repository";
import { findByEmail } from "@/modules/identity/repositories/user.repository";
import Order from "@/modules/orders/models/order.model";
import Ticket from "@/modules/tickets/models/ticket.model";
import CheckinLog from "@/modules/tickets/models/checkin-log.model";
import { create as createTicket, generateCode, generateSecret } from "@/modules/tickets/repositories/ticket.repository";
import { z } from "zod";

export type ActionState = {
  ok: boolean;
  message: string;
  redirectTo?: string;
  orderId?: string;
};

const EventFormSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(1).max(200).optional().or(z.literal("")),
  description: z.string().min(10),
  venueName: z.string().min(2),
  venueAddress: z.string().min(5),
  venueCity: z.string().min(2),
  venueState: z.string().length(2),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  coverImageUrl: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "cancelled", "finished"]),
});

const CartItemSchema = z.object({
  ticketTypeId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

const PurchaseFormSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Selecione ao menos um ingresso."),
  payerName: z.string().min(3, "Informe o nome completo do titular."),
  payerCpf: z.string().refine((value) => isValidCpf(value), "CPF inválido."),
  payerEmail: z.string().email("E-mail inválido."),
  payerPhone: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["pix", "credit_card", "boleto"]),
});

const DistributeFormSchema = z.object({
  email: z.string().email(),
  ticketTypeId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(50),
});

const pendingApprovals = new Map<string, NodeJS.Timeout>();

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function serializeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Nao foi possivel concluir a operacao.";
}

async function getAuthorizedEvent(eventId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError("Voce precisa estar autenticado.");
  }

  const event = await findById(eventId);
  if (!event) {
    throw new NotFoundError("Event", eventId);
  }

  if (session.user.role !== "admin" && event.organizerId !== session.user.id) {
    throw new UnauthorizedError("Voce nao tem permissao para este evento.");
  }

  return { session, event };
}

async function removeEventCascade(eventId: string) {
  const ticketTypeModel = TicketType as unknown as {
    find(filter: Record<string, unknown>): any;
    deleteMany(filter: Record<string, unknown>): Promise<unknown>;
  };
  const lotModel = Lot as unknown as {
    deleteMany(filter: Record<string, unknown>): Promise<unknown>;
  };
  const ticketTypes = (await ticketTypeModel.find({ eventId }).lean()) as Array<{ _id: string }>;
  const ticketTypeIds = ticketTypes.map((ticketType) => ticketType._id.toString());

  await Promise.all([
    ticketTypeModel.deleteMany({ eventId }),
    lotModel.deleteMany({ ticketTypeId: { $in: ticketTypeIds } }),
    Order.deleteMany({ eventId }),
    Ticket.deleteMany({ eventId }),
    CheckinLog.deleteMany({ eventId }),
    removeEventStaff(eventId),
  ]);

  await deleteEventById(eventId);
}

// Generates one valid ticket per unit on a paid order. Shared by the simulated
// payment flow and the organizer/admin ticket distribution flow.
async function issueTicketsForOrder(order: {
  _id: string;
  eventId: string;
  buyerId: string;
  items: Array<{ ticketTypeId: string; quantity: number }>;
}) {
  for (const item of order.items) {
    for (let index = 0; index < item.quantity; index += 1) {
      const code = generateCode();
      await createTicket({
        orderId: order._id,
        eventId: order.eventId,
        ticketTypeId: item.ticketTypeId,
        ownerId: order.buyerId,
        code,
        secret: generateSecret(code, order.buyerId),
        status: "valid",
      });
    }
  }
}

async function fulfillPaidOrder(orderId: string) {
  await connectDB();

  const orderModel = Order as unknown as {
    findById(id: string): any;
    findByIdAndUpdate(id: string, data: Record<string, unknown>, options: Record<string, unknown>): any;
  };

  const order = await orderModel.findById(orderId).lean();
  if (!order || order.status !== "pending") {
    return;
  }

  const orderItems = order.items as Array<{ ticketTypeId: string; lotId: string; quantity: number; unitPrice: number }>;
  const ticketTypeModel = TicketType as unknown as {
    findById(id: string): any;
    findOneAndUpdate(filter: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown>): any;
  };
  const lotModel = Lot as unknown as {
    findById(id: string): any;
    findOneAndUpdate(filter: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown>): any;
  };

  for (const item of orderItems) {
    const ticketType = await ticketTypeModel.findById(item.ticketTypeId).lean();
    const lot = await lotModel.findById(item.lotId).lean();
    if (!ticketType || !lot) {
      continue;
    }

    const nextTicketSold = Number(ticketType.soldQuantity ?? 0) + item.quantity;
    const nextLotSold = Number(lot.soldQuantity ?? 0) + item.quantity;

    await Promise.all([
      ticketTypeModel.findOneAndUpdate(
        { _id: item.ticketTypeId },
        { $set: { soldQuantity: nextTicketSold } },
        { new: true },
      ),
      lotModel.findOneAndUpdate(
        { _id: item.lotId },
        { $set: { soldQuantity: nextLotSold } },
        { new: true },
      ),
    ]);
  }

  const [freshOrder] = (await Promise.all([
    orderModel.findById(orderId).lean(),
    orderModel.findByIdAndUpdate(orderId, { status: "paid", paidAt: new Date() }, { new: true }).lean(),
  ])) as Array<any>;

  const paidOrder = freshOrder?.status === "paid" ? freshOrder : await orderModel.findById(orderId).lean();
  if (!paidOrder) {
    return;
  }

  await issueTicketsForOrder({
    _id: paidOrder._id,
    eventId: paidOrder.eventId,
    buyerId: paidOrder.buyerId,
    items: paidOrder.items as Array<{ ticketTypeId: string; quantity: number }>,
  });
}

function scheduleAutoApproval(orderId: string) {
  const existing = pendingApprovals.get(orderId);
  if (existing) {
    clearTimeout(existing);
  }

  const timeout = setTimeout(() => {
    void fulfillPaidOrder(orderId).finally(() => {
      pendingApprovals.delete(orderId);
    });
  }, 20_000);

  pendingApprovals.set(orderId, timeout);
}

export async function createEventAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError("Voce precisa estar autenticado para criar um evento.");
    }

    const parsed = EventFormSchema.safeParse({
      title: getString(formData, "title"),
      slug: getString(formData, "slug"),
      description: getString(formData, "description"),
      venueName: getString(formData, "venueName"),
      venueAddress: getString(formData, "venueAddress"),
      venueCity: getString(formData, "venueCity"),
      venueState: getString(formData, "venueState").toUpperCase(),
      startsAt: getString(formData, "startsAt"),
      endsAt: getString(formData, "endsAt"),
      coverImageUrl: getString(formData, "coverImageUrl"),
      status: getString(formData, "status"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o evento.");
    }

    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new Error("Informe datas validas para inicio e termino.");
    }

    if (endsAt <= startsAt) {
      throw new Error("A data de termino precisa ser posterior ao inicio.");
    }

    await connectDB();

    const title = parsed.data.title.trim();
    const slug = parsed.data.slug ? parsed.data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") : await generateSlug(title);

    const existing = await findBySlug(slug);
    if (existing) {
      throw new ConflictError("Ja existe um evento com esse slug.");
    }

    const event = await createEvent({
      organizerId: session.user.id,
      title,
      slug,
      description: parsed.data.description.trim(),
      venue: {
        name: parsed.data.venueName.trim(),
        address: parsed.data.venueAddress.trim(),
        city: parsed.data.venueCity.trim(),
        state: parsed.data.venueState,
      },
      startsAt,
      endsAt,
      coverImageUrl: parsed.data.coverImageUrl?.trim() || undefined,
      featured: false,
      status: parsed.data.status as EventStatus,
    });

    return { ok: true, message: "Evento criado com sucesso.", redirectTo: "/organizer/eventos", orderId: event._id };
  } catch (error) {
    return { ok: false, message: serializeError(error) };
  }
}

export async function updateEventAction(eventId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { event } = await getAuthorizedEvent(eventId);

    const parsed = EventFormSchema.safeParse({
      title: getString(formData, "title"),
      slug: getString(formData, "slug"),
      description: getString(formData, "description"),
      venueName: getString(formData, "venueName"),
      venueAddress: getString(formData, "venueAddress"),
      venueCity: getString(formData, "venueCity"),
      venueState: getString(formData, "venueState").toUpperCase(),
      startsAt: getString(formData, "startsAt"),
      endsAt: getString(formData, "endsAt"),
      coverImageUrl: getString(formData, "coverImageUrl"),
      status: getString(formData, "status"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o evento.");
    }

    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new Error("Informe datas validas para inicio e termino.");
    }

    if (endsAt <= startsAt) {
      throw new Error("A data de termino precisa ser posterior ao inicio.");
    }

    await connectDB();

    const title = parsed.data.title.trim();
    const nextSlug = parsed.data.slug ? parsed.data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") : event.slug;

    if (nextSlug !== event.slug) {
      const duplicate = await findBySlug(nextSlug);
      if (duplicate && duplicate._id !== event._id) {
        throw new ConflictError("Ja existe um evento com esse slug.");
      }
    }

    await updateEvent(eventId, {
      title,
      slug: nextSlug,
      description: parsed.data.description.trim(),
      venue: {
        name: parsed.data.venueName.trim(),
        address: parsed.data.venueAddress.trim(),
        city: parsed.data.venueCity.trim(),
        state: parsed.data.venueState,
      },
      startsAt,
      endsAt,
      coverImageUrl: parsed.data.coverImageUrl?.trim() || undefined,
      // featured é controlado pelo impulsionamento (boost), não pelo formulário.
      status: parsed.data.status as EventStatus,
    });

    return { ok: true, message: "Evento atualizado com sucesso.", redirectTo: "/organizer/eventos" };
  } catch (error) {
    return { ok: false, message: serializeError(error) };
  }
}

export async function deleteEventAction(eventId: string): Promise<void> {
  const { session, event } = await getAuthorizedEvent(eventId);
  await connectDB();
  await removeEventCascade(eventId);
  await recordAuditLog({
    action: "event.deleted",
    actorId: session.user.id,
    targetType: "event",
    targetId: eventId,
    metadata: { title: event.title },
  });
  redirect("/organizer/eventos");
}

// Owner/admin hands free (courtesy) tickets to an existing user by e-mail.
export async function distributeTicketsAction(eventId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { event } = await getAuthorizedEvent(eventId);

    const parsed = DistributeFormSchema.safeParse({
      email: getString(formData, "email").toLowerCase(),
      ticketTypeId: getString(formData, "ticketTypeId"),
      quantity: getString(formData, "quantity"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para a distribuicao.");
    }

    await connectDB();

    const recipient = await findByEmail(parsed.data.email);
    if (!recipient) {
      throw new NotFoundError("User", parsed.data.email);
    }

    const ticketTypeModel = TicketType as unknown as { findById(id: string): any };
    const lotModel = Lot as unknown as { findOne(filter: Record<string, unknown>): any; findByIdAndUpdate(id: string, data: any, options: any): any };

    const ticketType = await ticketTypeModel.findById(parsed.data.ticketTypeId).lean();
    if (!ticketType || String(ticketType.eventId) !== String(event._id)) {
      throw new NotFoundError("TicketType", parsed.data.ticketTypeId);
    }

    const totalSold = Number(ticketType.soldQuantity ?? 0) + parsed.data.quantity;
    if (totalSold > Number(ticketType.totalQuantity)) {
      throw new Error("Quantidade indisponivel para este tipo de ingresso.");
    }

    const lot = await lotModel.findOne({ ticketTypeId: ticketType._id, active: true }).sort({ createdAt: -1 }).lean();
    if (!lot) {
      throw new Error("Nao existe lote ativo para este ingresso.");
    }

    const order = await Order.create({
      buyerId: recipient._id,
      eventId: event._id,
      items: [{ ticketTypeId: String(ticketType._id), lotId: String(lot._id), quantity: parsed.data.quantity, unitPrice: 0 }],
      serviceFee: 0,
      totalAmount: 0,
      status: "paid",
      paymentIntentId: `comp_${crypto.randomUUID()}`,
      expiresAt: new Date(),
      paidAt: new Date(),
    });

    await issueTicketsForOrder({
      _id: order._id.toString(),
      eventId: String(event._id),
      buyerId: String(recipient._id),
      items: [{ ticketTypeId: String(ticketType._id), quantity: parsed.data.quantity }],
    });

    await Promise.all([
      incrementSoldQuantity(String(ticketType._id), parsed.data.quantity),
      lotModel.findByIdAndUpdate(String(lot._id), { $inc: { soldQuantity: parsed.data.quantity } }, { new: true }),
    ]);

    return {
      ok: true,
      message: `${parsed.data.quantity} ingresso(s) distribuido(s) para ${recipient.name}.`,
    };
  } catch (error) {
    return { ok: false, message: serializeError(error) };
  }
}

export async function createCheckoutAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError("Entre para testar o pagamento prototipo.");
    }

    await connectDB();

    const ticketTypeModel = TicketType as unknown as {
      findById(id: string): any;
      findOne(filter: Record<string, unknown>): any;
    };
    const lotModel = Lot as unknown as {
      findOne(filter: Record<string, unknown>): any;
    };

    // O carrinho chega como JSON ([{ ticketTypeId, quantity }]) num campo oculto.
    let cartItems: unknown = [];
    try {
      cartItems = JSON.parse(getString(formData, "items") || "[]");
    } catch {
      cartItems = [];
    }

    const parsed = PurchaseFormSchema.safeParse({
      items: cartItems,
      payerName: getString(formData, "payerName"),
      payerCpf: getString(formData, "payerCpf"),
      payerEmail: getString(formData, "payerEmail").toLowerCase(),
      payerPhone: getString(formData, "payerPhone"),
      paymentMethod: getString(formData, "paymentMethod"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para a compra.");
    }

    // Consolida quantidades por tipo (evita itens duplicados no carrinho).
    const quantityByType = new Map<string, number>();
    for (const item of parsed.data.items) {
      quantityByType.set(item.ticketTypeId, (quantityByType.get(item.ticketTypeId) ?? 0) + item.quantity);
    }

    let event: Awaited<ReturnType<typeof findById>> | null = null;
    const orderItems: Array<{ ticketTypeId: string; lotId: string; quantity: number; unitPrice: number }> = [];
    let subtotal = 0;

    for (const [ticketTypeId, quantity] of quantityByType) {
      const ticketType = await ticketTypeModel.findById(ticketTypeId).lean();
      if (!ticketType) {
        throw new NotFoundError("TicketType", ticketTypeId);
      }

      // Todos os ingressos do carrinho precisam ser do mesmo evento.
      if (!event) {
        event = await findById(ticketType.eventId);
        if (!event) {
          throw new NotFoundError("Event", ticketType.eventId);
        }
      } else if (String(ticketType.eventId) !== String(event._id)) {
        throw new Error("Todos os ingressos do carrinho devem ser do mesmo evento.");
      }

      const lot = await lotModel.findOne({ ticketTypeId: ticketType._id, active: true }).sort({ createdAt: -1 }).lean();
      if (!lot) {
        throw new Error(`Nao existe lote ativo para o ingresso ${ticketType.name}.`);
      }

      if (quantity > Number(ticketType.maxPerOrder ?? 5)) {
        throw new Error(`Quantidade acima do limite por pedido para ${ticketType.name}.`);
      }

      const totalSold = Number(ticketType.soldQuantity ?? 0) + quantity;
      if (totalSold > Number(ticketType.totalQuantity)) {
        throw new Error(`Quantidade indisponivel para o ingresso ${ticketType.name}.`);
      }

      const unitPrice = Number(lot.price ?? ticketType.price);
      subtotal += unitPrice * quantity;
      orderItems.push({ ticketTypeId: String(ticketType._id), lotId: String(lot._id), quantity, unitPrice });
    }

    if (!event || orderItems.length === 0) {
      throw new Error("Selecione ao menos um ingresso.");
    }

    const { serviceFee, total } = priceBreakdown(subtotal);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const order = await Order.create({
      buyerId: session.user.id,
      eventId: event._id,
      items: orderItems,
      payer: {
        name: parsed.data.payerName,
        cpf: parsed.data.payerCpf,
        email: parsed.data.payerEmail,
        phone: parsed.data.payerPhone || undefined,
      },
      paymentMethod: parsed.data.paymentMethod,
      serviceFee,
      totalAmount: total,
      status: "pending",
      paymentIntentId: `proto_${crypto.randomUUID()}`,
      expiresAt,
    });

    scheduleAutoApproval(order._id.toString());

    return {
      ok: true,
      message: "Compra simulada criada. O pedido sera aprovado automaticamente em 20 segundos.",
      orderId: order._id.toString(),
      redirectTo: `/eventos/${event.slug}/checkout`,
    };
  } catch (error) {
    return { ok: false, message: serializeError(error) };
  }
}