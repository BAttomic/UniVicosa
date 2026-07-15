import { connectDB } from "@/lib/db";
import AuditLog from "@/modules/audit/models/audit-log.model";

type AuditInput = {
  action: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

// Registro best-effort: a auditoria nunca deve interromper a operação principal,
// então qualquer falha é apenas logada.
export async function recordAuditLog(input: AuditInput): Promise<void> {
  try {
    await connectDB();
    const A = AuditLog as unknown as { create(data: AuditInput & { occurredAt: Date }): Promise<unknown> };
    await A.create({ ...input, occurredAt: new Date() });
  } catch (error) {
    console.error("[audit] falha ao registrar", input.action, error);
  }
}
