import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum PaymentMethod {
  PIX = "pix",
  CREDIT_CARD = "credit_card",
  BOLETO = "boleto",
}

export interface IOrderItem {
  ticketTypeId: string;
  lotId: string;
  quantity: number;
  unitPrice: number; // cents
}

// Buyer identification captured at checkout. In Brazil a ticket purchase requires
// the payer's full name and CPF (used on the nota fiscal and for nominal tickets),
// so it is stored as a snapshot on the order.
export interface IOrderPayer {
  name: string;
  cpf: string;
  email: string;
  phone?: string;
}

export interface IOrder {
  _id: string;
  buyerId: string;
  eventId: string;
  items: IOrderItem[];
  payer?: IOrderPayer;
  paymentMethod?: PaymentMethod;
  serviceFee: number; // cents — 5% platform fee paid by the buyer
  totalAmount: number; // cents — subtotal + serviceFee (what the buyer pays)
  status: OrderStatus;
  paymentIntentId?: string;
  expiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
}

const OrderItemSchema = new Schema({
  ticketTypeId: { type: String, required: true },
  lotId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
});

const OrderPayerSchema = new Schema(
  {
    name: { type: String, required: true },
    cpf: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: { type: String, required: true },
    eventId: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    payer: { type: OrderPayerSchema },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod) },
    serviceFee: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    paymentIntentId: { type: String },
    expiresAt: { type: Date, required: true },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

// Indexes
OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.models.Order || model<IOrder>("Order", OrderSchema, tccCollectionName("orders"));
