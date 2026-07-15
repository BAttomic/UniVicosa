import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

// Per-event role assignment. The event owner (Event.organizerId) is the
// organizer; additional users can be added as operators for that single event.
export enum EventStaffRole {
  OPERATOR = "operator",
}

export interface IEventStaff {
  _id: string;
  eventId: string;
  userId: string;
  role: EventStaffRole;
  addedBy: string;
  createdAt: Date;
}

const EventStaffSchema = new Schema<IEventStaff>(
  {
    eventId: { type: String, required: true },
    userId: { type: String, required: true },
    role: { type: String, enum: Object.values(EventStaffRole), required: true, default: EventStaffRole.OPERATOR },
    addedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

EventStaffSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventStaffSchema.index({ userId: 1 });

export default mongoose.models.EventStaff || model<IEventStaff>("EventStaff", EventStaffSchema, tccCollectionName("event_staff"));
