import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export interface ICheckinLog {
  _id: string;
  ticketId: string;
  operatorId: string;
  eventId: string;
  occurredAt: Date;
  offline: boolean;
  deviceId?: string;
}

const CheckinLogSchema = new Schema<ICheckinLog>(
  {
    ticketId: { type: String, required: true },
    operatorId: { type: String, required: true },
    eventId: { type: String, required: true },
    occurredAt: { type: Date, default: Date.now },
    offline: { type: Boolean, default: false },
    deviceId: { type: String },
  },
  { timestamps: true },
);

CheckinLogSchema.index({ ticketId: 1 });
CheckinLogSchema.index({ eventId: 1, occurredAt: -1 });

export default mongoose.models.CheckinLog || model<ICheckinLog>("CheckinLog", CheckinLogSchema, tccCollectionName("checkin_logs"));
