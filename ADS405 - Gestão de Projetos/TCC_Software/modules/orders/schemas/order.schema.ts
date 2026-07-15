import { z } from "zod";

export const CreateOrderItemSchema = z.object({
  ticketTypeId: z.string(),
  lotId: z.string(),
  quantity: z.number().min(1),
});

export const CreateOrderSchema = z.object({
  eventId: z.string(),
  items: z.array(CreateOrderItemSchema).min(1),
});

export const OrderOutputSchema = z.object({
  _id: z.string(),
  buyerId: z.string(),
  eventId: z.string(),
  items: z.array(
    z.object({
      ticketTypeId: z.string(),
      lotId: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
  totalAmount: z.number(),
  status: z.enum(["pending", "paid", "failed", "cancelled", "expired"]),
  expiresAt: z.coerce.date(),
  paidAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type OrderOutput = z.infer<typeof OrderOutputSchema>;
