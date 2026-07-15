import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

// Waitlist ("fila de espera") for events that are not yet on sale — i.e. tickets
// will be released soon but no lot is active right now. Interested buyers leave
// their contact so they can be notified when sales open.
export interface IWaitlistEntry {
  _id: string;
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  status: "waiting" | "notified" | "converted";
  createdAt: Date;
}

const WaitlistSchema = new Schema<IWaitlistEntry>(
  {
    eventId: { type: String, required: true },
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    status: { type: String, enum: ["waiting", "notified", "converted"], default: "waiting" },
  },
  { timestamps: true },
);

// Uma inscrição por conta por evento (fila FIFO por conta). O índice por e-mail
// é mantido para compatibilidade com inscrições antigas (sem conta).
WaitlistSchema.index({ eventId: 1, userId: 1 }, { unique: true, sparse: true });
WaitlistSchema.index({ eventId: 1, email: 1 }, { unique: true });

export default mongoose.models.Waitlist || model<IWaitlistEntry>("Waitlist", WaitlistSchema, tccCollectionName("waitlist"));
