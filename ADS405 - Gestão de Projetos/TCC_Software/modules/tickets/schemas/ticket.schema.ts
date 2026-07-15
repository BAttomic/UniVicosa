import { z } from "zod";

export const ValidateTicketSchema = z.object({
  ticketId: z.string(),
  secret: z.string().min(1),
});

export const TicketOutputSchema = z.object({
  _id: z.string(),
  orderId: z.string(),
  eventId: z.string(),
  ticketTypeId: z.string(),
  ownerId: z.string(),
  code: z.string(),
  status: z.enum(["valid", "used", "cancelled"]),
  usedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
});

export type ValidateTicketInput = z.infer<typeof ValidateTicketSchema>;
export type TicketOutput = z.infer<typeof TicketOutputSchema>;
