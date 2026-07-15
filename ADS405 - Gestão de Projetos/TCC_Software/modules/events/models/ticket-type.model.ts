import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export interface ITicketType {
  _id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number; // price in cents (BRL)
  totalQuantity: number;
  soldQuantity: number;
  maxPerOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
  {
    eventId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 }, // cents
    totalQuantity: { type: Number, required: true, min: 0 },
    soldQuantity: { type: Number, required: true, default: 0, min: 0 },
    maxPerOrder: { type: Number, required: true, default: 5, min: 1 },
  },
  { timestamps: true },
);

TicketTypeSchema.index({ eventId: 1 });

export default mongoose.models.TicketType || model<ITicketType>("TicketType", TicketTypeSchema, tccCollectionName("ticket_types"));
