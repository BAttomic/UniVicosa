import { z } from "zod";

export const CreateEventSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).optional(),
  description: z.string().min(10),
  venueName: z.string().min(2),
  venueAddress: z.string().min(5),
  venueCity: z.string().min(2),
  venueState: z.string().length(2),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const TicketTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  totalQuantity: z.number().min(1),
  maxPerOrder: z.number().min(1).default(5),
});

export const LotSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(1),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  active: z.boolean().default(true),
});

export const EventOutputSchema = z.object({
  _id: z.string(),
  organizerId: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  venue: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
  }),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  coverImageUrl: z.string().optional(),
  status: z.enum(["draft", "published", "cancelled", "finished"]),
  createdAt: z.coerce.date(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type TicketTypeInput = z.infer<typeof TicketTypeSchema>;
export type LotInput = z.infer<typeof LotSchema>;
export type EventOutput = z.infer<typeof EventOutputSchema>;
