"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findById, findByEmail, updateUserById, deleteUserById } from "@/modules/identity/repositories/user.repository";
import { isValidCpf, formatCpf } from "@/lib/br-validators";
import { redirect } from "next/navigation";

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().optional().or(z.literal("")),
  cpf: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || isValidCpf(value), "CPF inválido."),
});

const ChangeEmailSchema = z.object({
  email: z.string().email("E-mail inválido."),
  currentPassword: z.string().min(1, "Informe a senha atual para confirmar."),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

function getValue(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireRole(["buyer", "organizer", "operator", "admin"]);
  await connectDB();

  const parsed = UpdateProfileSchema.safeParse({
    name: getValue(formData, "name"),
    phone: getValue(formData, "phone"),
    cpf: getValue(formData, "cpf"),
  });

  if (!parsed.success) {
    redirect("/perfil?status=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos."));
  }

  await updateUserById(session.user.id, {
    name: parsed.data.name,
    phone: parsed.data.phone || undefined,
    cpf: parsed.data.cpf ? formatCpf(parsed.data.cpf) : undefined,
  });

  redirect("/perfil?status=" + encodeURIComponent("Perfil atualizado com sucesso."));
}

// Trocar e-mail exige a senha atual (evita sequestro de sessão) e garante
// unicidade do novo e-mail.
export async function changeEmailAction(formData: FormData) {
  const session = await requireRole(["buyer", "organizer", "operator", "admin"]);
  await connectDB();

  const parsed = ChangeEmailSchema.safeParse({
    email: getValue(formData, "email").toLowerCase(),
    currentPassword: getValue(formData, "currentPassword"),
  });

  if (!parsed.success) {
    redirect("/perfil?status=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos."));
  }

  const user = await findById(session.user.id);
  if (!user) redirect("/perfil?status=" + encodeURIComponent("Usuário não encontrado."));

  const matches = await bcrypt.compare(parsed.data.currentPassword, user!.passwordHash);
  if (!matches) {
    redirect("/perfil?status=" + encodeURIComponent("Senha atual incorreta."));
  }

  if (parsed.data.email === user!.email) {
    redirect("/perfil?status=" + encodeURIComponent("O novo e-mail é igual ao atual."));
  }

  const existing = await findByEmail(parsed.data.email);
  if (existing && String(existing._id) !== session.user.id) {
    redirect("/perfil?status=" + encodeURIComponent("Já existe uma conta com este e-mail."));
  }

  await updateUserById(session.user.id, { email: parsed.data.email });

  redirect("/perfil?status=" + encodeURIComponent("E-mail atualizado. Entre novamente para atualizar a sessão."));
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireRole(["buyer", "organizer", "operator", "admin"]);
  await connectDB();

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: getValue(formData, "currentPassword"),
    newPassword: getValue(formData, "newPassword"),
  });

  if (!parsed.success) {
    redirect("/perfil?status=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos."));
  }

  const user = await findById(session.user.id);
  if (!user) redirect("/perfil?status=" + encodeURIComponent("Usuário não encontrado."));

  const matches = await bcrypt.compare(parsed.data.currentPassword, user!.passwordHash);
  if (!matches) {
    redirect("/perfil?status=" + encodeURIComponent("Senha atual incorreta."));
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await updateUserById(session.user.id, { passwordHash: hash });

  redirect("/perfil?status=" + encodeURIComponent("Senha alterada com sucesso."));
}

export async function deleteAccountAction() {
  const session = await requireRole(["buyer", "organizer", "operator", "admin"]);
  await connectDB();

  await deleteUserById(session.user.id);
  redirect("/");
}
