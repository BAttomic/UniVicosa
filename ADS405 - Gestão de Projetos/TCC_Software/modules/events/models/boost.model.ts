import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export enum BoostStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

// Impulsionamento pago de um evento pelo próprio organizador. É a fonte de
// receita "promoções pagas" da plataforma (o organizador paga para aparecer em
// destaque na home e na busca durante um período).
export interface IBoost {
  _id: string;
  eventId: string;
  organizerId: string;
  packageId: string;
  packageLabel: string;
  amount: number; // cents — pago pelo organizador à plataforma
  durationDays: number;
  status: BoostStatus;
  paymentIntentId?: string;
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const BoostSchema = new Schema<IBoost>(
  {
    eventId: { type: String, required: true },
    organizerId: { type: String, required: true },
    packageId: { type: String, required: true },
    packageLabel: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    status: { type: String, enum: Object.values(BoostStatus), default: BoostStatus.ACTIVE },
    paymentIntentId: { type: String },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

BoostSchema.index({ eventId: 1, status: 1 });
BoostSchema.index({ organizerId: 1, createdAt: -1 });

export default mongoose.models.Boost || model<IBoost>("Boost", BoostSchema, tccCollectionName("boosts"));
