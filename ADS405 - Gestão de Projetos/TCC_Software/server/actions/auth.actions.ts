"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { RegisterSchema } from "@/modules/identity/schemas/user.schema";
import { createUser, findByEmail, updatePasswordById } from "@/modules/identity/repositories/user.repository";
import { UserRole } from "@/modules/identity/models/user.model";
import { saveResetToken, consumeResetToken } from "@/lib/password-reset-store";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

type ActionResult = {
  ok: boolean;
  message: string;
};

export async function registerUser(input: unknown): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de cadastro invalidos." };
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await findByEmail(email);

  if (existing) {
    return { ok: false, message: "Este e-mail ja esta em uso." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const isOrganizer = parsed.data.role === "organizer";
  const role = isOrganizer ? UserRole.ORGANIZER : UserRole.BUYER;
  const organizerProfile = isOrganizer && parsed.data.organizerProfile
    ? {
        ...parsed.data.organizerProfile,
        tradeName: parsed.data.organizerProfile.tradeName || undefined,
        pixKey: parsed.data.organizerProfile.pixKey || undefined,
        address: {
          ...parsed.data.organizerProfile.address,
          complement: parsed.data.organizerProfile.address.complement || undefined,
        },
      }
    : undefined;

  const emailVerificationToken = crypto.randomBytes(24).toString("hex");

  await createUser({
    email,
    name: parsed.data.name,
    passwordHash,
    role,
    phone: parsed.data.phone ?? organizerProfile?.phone,
    organizerProfile,
    emailVerificationToken,
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email/${emailVerificationToken}`;
  await sendVerificationEmail({ to: email, name: parsed.data.name, verifyUrl });

  return { ok: true, message: "Cadastro realizado! Enviamos um e-mail para você confirmar seu endereço." };
}

export async function requestPasswordReset(emailInput: string): Promise<ActionResult> {
  await connectDB();
  const email = emailInput.toLowerCase().trim();
  const user = await findByEmail(email);

  if (!user) {
    return {
      ok: true,
      message: "Se o e-mail existir, enviaremos as instrucoes de recuperacao.",
    };
  }

  const token = crypto.randomBytes(24).toString("hex");
  saveResetToken(token, user._id);

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;
  await sendPasswordResetEmail({ to: email, name: user.name, resetUrl });

  return {
    ok: true,
    message: "Se o e-mail existir, enviaremos as instrucoes de recuperacao.",
  };
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult> {
  if (newPassword.length < 8) {
    return { ok: false, message: "A senha deve ter no minimo 8 caracteres." };
  }

  const userId = consumeResetToken(token);
  if (!userId) {
    return { ok: false, message: "Token invalido ou expirado." };
  }

  await connectDB();
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await updatePasswordById(userId, passwordHash);

  return { ok: true, message: "Senha atualizada com sucesso." };
}
