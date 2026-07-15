import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

// Global access is now just "regular user" (BUYER) vs ADMIN. Any user can create
// events (becoming their organizer) and be assigned as an operator per event via
// the EventStaff collection. ORGANIZER/OPERATOR are kept only for legacy data.
export enum UserRole {
  BUYER = "buyer",
  ORGANIZER = "organizer",
  OPERATOR = "operator",
  ADMIN = "admin",
}

// Legal/fiscal data required in Brazil to operate as an event organizer and
// receive payouts. Filled when a user signs up intending to sell tickets.
export interface IOrganizerProfile {
  personType: "pf" | "pj"; // pessoa física ou jurídica
  legalName: string; // razão social (PJ) ou nome completo (PF)
  tradeName?: string; // nome fantasia (PJ)
  document: string; // CNPJ (PJ) ou CPF (PF)
  responsibleName: string; // responsável legal
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  pixKey?: string; // chave PIX para repasses
}

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  cpf?: string;
  phone?: string;
  organizerProfile?: IOrganizerProfile;
  createdAt: Date;
  emailVerifiedAt?: Date;
  emailVerificationToken?: string;
}

const OrganizerAddressSchema = new Schema(
  {
    cep: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    district: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, length: 2 },
  },
  { _id: false },
);

const OrganizerProfileSchema = new Schema(
  {
    personType: { type: String, enum: ["pf", "pj"], required: true },
    legalName: { type: String, required: true },
    tradeName: { type: String },
    document: { type: String, required: true },
    responsibleName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: OrganizerAddressSchema, required: true },
    pixKey: { type: String },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.BUYER },
    cpf: { type: String, trim: true, select: false },
    phone: { type: String, trim: true },
    organizerProfile: { type: OrganizerProfileSchema },
    createdAt: { type: Date, default: Date.now },
    emailVerifiedAt: { type: Date },
    emailVerificationToken: { type: String, select: false },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1 });

// Prevent overwriting the model on hot reload (Next.js dev)
export default mongoose.models.User || model<IUser>("User", UserSchema, tccCollectionName("users"));
