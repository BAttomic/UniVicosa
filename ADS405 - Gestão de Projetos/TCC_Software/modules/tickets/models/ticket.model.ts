import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export enum TicketStatus {
  VALID = "valid",
  USED = "used",
  CANCELLED = "cancelled",
}

export interface ITicket {
  _id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  ownerId: string;
  code: string; // UUID - public identifier
  secret: string; // HMAC, rotates every 30s
  status: TicketStatus;
  usedAt?: Date;
  usedBy?: string; // operatorId
  createdAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    orderId: { type: String, required: true },
    eventId: { type: String, required: true },
    ticketTypeId: { type: String, required: true },
    ownerId: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    secret: { type: String, required: true },
    status: { type: String, enum: Object.values(TicketStatus), default: TicketStatus.VALID },
    usedAt: { type: Date },
    usedBy: { type: String },
  },
  { timestamps: true },
);

TicketSchema.index({ ownerId: 1 });
TicketSchema.index({ eventId: 1, status: 1 });
TicketSchema.index({ orderId: 1 });

export default mongoose.models.Ticket || model<ITicket>("Ticket", TicketSchema, tccCollectionName("tickets"));
