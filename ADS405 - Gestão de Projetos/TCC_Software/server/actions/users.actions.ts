"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/lib/require-role";
import { createUser, deleteUserById, findByEmail, updateUserById } from "@/modules/identity/repositories/user.repository";
import { UserRole } from "@/modules/identity/models/user.model";
import { recordAuditLog } from "@/lib/audit";

// Global roles collapsed to "user" vs "admin"; event-level roles (operator)
// live in EventStaff. "user" maps to the legacy BUYER enum value.
const AccessRole = z.enum(["user", "admin"]);

const StaffUserSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: AccessRole,
});

const StaffUserUpdateSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  role: AccessRole,
});

function toUserRole(role: "user" | "admin"): UserRole {
  return role === "admin" ? UserRole.ADMIN : UserRole.BUYER;
}

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createStaffUserAction(formData: FormData) {
  let status: string;
  try {
    const admin = await requireRole("admin");
    const parsed = StaffUserSchema.safeParse({
      name: getValue(formData, "name"),
      email: getValue(formData, "email"),
      password: getValue(formData, "password"),
      role: getValue(formData, "role"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o usuario.");
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await findByEmail(email);
    if (existing) {
      throw new ConflictError("Ja existe um usuario com este e-mail.");
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const created = await createUser({
      email,
      name: parsed.data.name,
      passwordHash,
      role: toUserRole(parsed.data.role),
    });

    await recordAuditLog({
      action: "user.created",
      actorId: admin.user.id,
      targetType: "user",
      targetId: String(created?._id ?? email),
      metadata: { email, role: parsed.data.role },
    });

    status = "Usuário criado com sucesso.";
  } catch (error) {
    status = error instanceof Error ? error.message : "Nao foi possivel criar o usuario.";
  }

  redirect(`/admin/usuarios?status=${encodeURIComponent(status)}`);
}

export async function updateStaffUserAction(userId: string, formData: FormData) {
  let status: string;
  try {
    const admin = await requireRole("admin");
    const parsed = StaffUserUpdateSchema.safeParse({
      name: getValue(formData, "name"),
      email: getValue(formData, "email"),
      password: getValue(formData, "password"),
      role: getValue(formData, "role"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o usuario.");
    }

    const existing = await findByEmail(parsed.data.email.toLowerCase());
    if (existing && existing._id !== userId) {
      throw new ConflictError("Ja existe outro usuario com este e-mail.");
    }

    const updateData: Record<string, unknown> = {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: toUserRole(parsed.data.role),
    };

    if (parsed.data.password) {
      updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    }

    const updated = await updateUserById(userId, updateData);
    if (!updated) {
      throw new NotFoundError("User", userId);
    }

    await recordAuditLog({
      action: "user.updated",
      actorId: admin.user.id,
      targetType: "user",
      targetId: userId,
      metadata: { email: updateData.email, role: parsed.data.role, passwordChanged: Boolean(parsed.data.password) },
    });

    status = "Usuário atualizado com sucesso.";
  } catch (error) {
    status = error instanceof Error ? error.message : "Nao foi possivel atualizar o usuario.";
  }

  redirect(`/admin/usuarios?status=${encodeURIComponent(status)}`);
}

export async function deleteStaffUserAction(userId: string) {
  let status: string;
  try {
    const admin = await requireRole("admin");
    const deleted = await deleteUserById(userId);
    if (!deleted) {
      throw new NotFoundError("User", userId);
    }

    await recordAuditLog({
      action: "user.deleted",
      actorId: admin.user.id,
      targetType: "user",
      targetId: userId,
    });

    status = "Usuário removido com sucesso.";
  } catch (error) {
    status = error instanceof Error ? error.message : "Nao foi possivel remover o usuario.";
  }

  redirect(`/admin/usuarios?status=${encodeURIComponent(status)}`);
}
