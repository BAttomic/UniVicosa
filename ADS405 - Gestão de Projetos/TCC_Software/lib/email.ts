import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM_ADDRESS = "TicketFlow <noreply@ticketflow.com.br>";

type SendPasswordResetOptions = {
  to: string;
  name: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendPasswordResetOptions) {
  if (!resend) {
    console.log(`[email:password-reset] Para: ${to} | URL: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Recuperação de senha — TicketFlow",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
        <h2 style="color:#0f172a;margin-bottom:8px">Olá, ${name}!</h2>
        <p style="color:#475569">Recebemos uma solicitação para redefinir a senha da sua conta no TicketFlow.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:14px 28px;background:#0f172a;color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Redefinir minha senha
        </a>
        <p style="color:#94a3b8;font-size:13px">
          Este link expira em 30 minutos. Se você não solicitou a redefinição, ignore este e-mail.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">TicketFlow — Plataforma de ingressos online</p>
      </div>
    `,
  });
}

type SendVerificationOptions = {
  to: string;
  name: string;
  verifyUrl: string;
};

export async function sendVerificationEmail({ to, name, verifyUrl }: SendVerificationOptions) {
  if (!resend) {
    console.log(`[email:verify] Para: ${to} | URL: ${verifyUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Confirme seu e-mail — TicketFlow",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
        <h2 style="color:#0f172a;margin-bottom:8px">Bem-vindo(a), ${name}!</h2>
        <p style="color:#475569">Confirme seu endereço de e-mail para concluir o cadastro no TicketFlow.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;margin:24px 0;padding:14px 28px;background:#0f172a;color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Confirmar meu e-mail
        </a>
        <p style="color:#94a3b8;font-size:13px">Se você não criou esta conta, ignore este e-mail.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">TicketFlow — Plataforma de ingressos online</p>
      </div>
    `,
  });
}

type SendOrderConfirmationOptions = {
  to: string;
  name: string;
  eventTitle: string;
  orderId: string;
  totalAmount: number;
};

export async function sendOrderConfirmationEmail({ to, name, eventTitle, orderId, totalAmount }: SendOrderConfirmationOptions) {
  const orderUrl = `${process.env.NEXTAUTH_URL}/orders/${orderId}`;
  const totalBRL = (totalAmount / 100).toFixed(2).replace(".", ",");

  if (!resend) {
    console.log(`[email:order-confirmation] Para: ${to} | Pedido: ${orderId}`);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Compra confirmada: ${eventTitle} — TicketFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
        <h2 style="color:#0f172a;margin-bottom:8px">Compra confirmada, ${name}!</h2>
        <p style="color:#475569">Seu pedido para <strong>${eventTitle}</strong> foi aprovado.</p>
        <div style="margin:20px 0;padding:16px;background:#ecfdf5;border-radius:12px;border:1px solid #d1fae5">
          <p style="margin:0;color:#065f46;font-weight:600">Total: R$ ${totalBRL}</p>
          <p style="margin:4px 0 0;color:#047857;font-size:13px">Pedido #${orderId.slice(-6)}</p>
        </div>
        <a href="${orderUrl}"
           style="display:inline-block;margin:16px 0;padding:14px 28px;background:#0f172a;color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Ver meus ingressos
        </a>
        <p style="color:#94a3b8;font-size:12px">TicketFlow — Plataforma de ingressos online</p>
      </div>
    `,
  });
}
