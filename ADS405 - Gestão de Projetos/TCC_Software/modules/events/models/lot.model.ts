import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export interface ILot {
  _id: string;
  ticketTypeId: string;
  name: string;
  price: number; // price in cents
  quantity: number;
  soldQuantity: number;
  startsAt?: Date;
  endsAt?: Date;
  active: boolean;
  createdAt: Date;
}

const LotSchema = new Schema<ILot>(
  {
    ticketTypeId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    soldQuantity: { type: Number, required: true, default: 0, min: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

LotSchema.index({ ticketTypeId: 1, active: 1 });
LotSchema.index({ startsAt: 1, endsAt: 1 });

export default mongoose.models.Lot || model<ILot>("Lot", LotSchema, tccCollectionName("lots"));
