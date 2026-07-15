import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

// Trilha de auditoria de ações sensíveis (administrativas e de segurança).
// Complementa os logs da aplicação com um registro consultável e imutável de
// "quem fez o quê e quando".
export interface IAuditLog {
  _id: string;
  action: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  actorId: { type: String },
  targetType: { type: String },
  targetId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  occurredAt: { type: Date, default: Date.now },
});

AuditLogSchema.index({ action: 1, occurredAt: -1 });
AuditLogSchema.index({ actorId: 1, occurredAt: -1 });

export default mongoose.models.AuditLog ||
  model<IAuditLog>("AuditLog", AuditLogSchema, tccCollectionName("audit_logs"));
