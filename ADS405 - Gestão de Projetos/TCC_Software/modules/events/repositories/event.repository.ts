import Event, { IEvent, EventStatus } from "../models/event.model";
import TicketType from "../models/ticket-type.model";
import { accentInsensitivePattern } from "@/lib/search";

const E = Event as unknown as {
  create(data: any): Promise<any>;
  findById(id: string): any;
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  exists(filter: Record<string, unknown>): Promise<boolean>;
  findByIdAndUpdate(id: string, data: Partial<IEvent>, options: any): any;
  findByIdAndDelete(id: string): any;
};

const TT = TicketType as unknown as {
  aggregate(pipeline: Array<Record<string, unknown>>): Promise<Array<{ _id: string; totalQuantity: number }>>;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function prioritizePreferredCity<T extends { venue: { city: string }; startsAt: Date | string; featured?: boolean }>(
  events: T[],
  preferredCity: string,
  options: { featuredFirst?: boolean } = {},
) {
  const featuredFirst = options.featuredFirst ?? true;
  const normalizedPreferredCity = normalizeText(preferredCity);

  return [...events].sort((left, right) => {
    // Featured (sponsored) events come first — except quando queremos uma lista
    // puramente por proximidade (ex.: "Mais próximos", que não deve repetir os
    // destaques já exibidos na vitrine própria).
    if (featuredFirst) {
      const featuredDiff = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
      if (featuredDiff !== 0) {
        return featuredDiff;
      }
    }

    const leftPreferred = normalizeText(left.venue.city) === normalizedPreferredCity ? 0 : 1;
    const rightPreferred = normalizeText(right.venue.city) === normalizedPreferredCity ? 0 : 1;

    if (leftPreferred !== rightPreferred) {
      return leftPreferred - rightPreferred;
    }

    return new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime();
  });
}

export async function create(data: Omit<IEvent, "_id" | "createdAt" | "updatedAt">): Promise<IEvent> {
  return (await E.create(data)) as unknown as IEvent;
}

export async function findById(id: string): Promise<IEvent | null> {
  return (await E.findById(id).lean()) as unknown as (IEvent | null);
}

export async function findBySlug(slug: string): Promise<IEvent | null> {
  return (await E.findOne({ slug }).lean()) as unknown as (IEvent | null);
}

export async function findByOrganizerId(organizerId: string): Promise<IEvent[]> {
  return (await E.find({ organizerId }).sort({ startsAt: -1 }).lean()) as unknown as IEvent[];
}

export async function findAll(): Promise<IEvent[]> {
  return (await E.find({}).sort({ createdAt: -1 }).lean()) as unknown as IEvent[];
}

export async function findPublishedFiltered(params: {
  city?: string;
  state?: string;
  search?: string;
  startsFrom?: Date;
  startsTo?: Date;
  preferredCity?: string;
}): Promise<IEvent[]> {
  const filter: Record<string, unknown> = { status: EventStatus.PUBLISHED };

  // City stays as a (legacy) partial, accent-insensitive match so links like the
  // home hero "Cidade: Rio" still resolve to "Rio de Janeiro".
  if (params.city) {
    filter["venue.city"] = { $regex: accentInsensitivePattern(params.city), $options: "i" };
  }
  if (params.state) filter["venue.state"] = params.state;

  // A single search term spans the fields a user would naturally type: event
  // title, description and location.
  if (params.search) {
    const pattern = accentInsensitivePattern(params.search);
    const matcher = { $regex: pattern, $options: "i" };
    filter.$or = [
      { title: matcher },
      { description: matcher },
      { "venue.city": matcher },
      { "venue.name": matcher },
      { "venue.state": matcher },
    ];
  }

  if (params.startsFrom || params.startsTo) {
    const range: Record<string, Date> = {};
    if (params.startsFrom) range.$gte = params.startsFrom;
    if (params.startsTo) range.$lte = params.startsTo;
    filter.startsAt = range;
  }

  const events = (await E.find(filter).sort({ featured: -1, startsAt: 1 }).lean()) as unknown as IEvent[];
  return params.city ? events : prioritizePreferredCity(events, params.preferredCity ?? "Viçosa");
}

export type FeaturedEvent = IEvent & {
  totalTickets: number;
};

export async function findFeaturedPublished(limit = 6, preferredCity = "Viçosa"): Promise<{
  upcoming: FeaturedEvent[];
  largest: FeaturedEvent[];
  featured: FeaturedEvent[];
}> {
  const events = (await E.find({ status: EventStatus.PUBLISHED }).sort({ startsAt: 1 }).lean()) as unknown as IEvent[];
  const ticketTotals = await TT.aggregate([
    { $group: { _id: "$eventId", totalQuantity: { $sum: "$totalQuantity" } } },
  ]);

  const totalsByEvent = new Map(ticketTotals.map((item) => [String(item._id), item.totalQuantity]));
  const featured = events.map((event) => ({
    ...event,
    totalTickets: totalsByEvent.get(String(event._id)) ?? 0,
  }));

  // "Mais próximos": por proximidade (cidade preferida) + data, sem priorizar
  // destaques (que têm vitrine própria) — assim não fica "só destaque".
  const upcoming = prioritizePreferredCity(featured, preferredCity, { featuredFirst: false }).slice(0, limit);
  // Eventos patrocinados (featured) ordenados por data — alimentam a vitrine "Destaques".
  const sponsored = featured
    .filter((event) => event.featured)
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());

  return {
    upcoming,
    largest: [...featured].sort((left, right) => right.totalTickets - left.totalTickets).slice(0, limit),
    featured: sponsored.slice(0, 10),
  };
}

export async function update(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
  return (await E.findByIdAndUpdate(id, data, { new: true }).lean()) as unknown as (IEvent | null);
}

export async function deleteById(id: string): Promise<IEvent | null> {
  return (await E.findByIdAndDelete(id).lean()) as unknown as (IEvent | null);
}

export async function generateSlug(title: string): Promise<string> {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
  let slug = base;
  let count = 1;
  while (await E.exists({ slug })) {
    slug = `${base}-${count}`;
    count += 1;
  }
  return slug;
}
