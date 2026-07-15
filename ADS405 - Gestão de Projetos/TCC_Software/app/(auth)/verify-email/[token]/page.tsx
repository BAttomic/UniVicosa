import Link from "next/link";
import { connectDB } from "@/lib/db";
import { findByVerificationToken, markEmailVerified } from "@/modules/identity/repositories/user.repository";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

type VerifyEmailPageProps = {
  params: Promise<{ token: string }>;
};

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = await params;
  await connectDB();

  const user = await findByVerificationToken(token);
  let ok = false;
  let alreadyVerified = false;

  if (user) {
    if (user.emailVerifiedAt) {
      ok = true;
      alreadyVerified = true;
    } else {
      await markEmailVerified(String(user._id));
      await recordAuditLog({
        action: "user.email_verified",
        actorId: String(user._id),
        targetType: "user",
        targetId: String(user._id),
      });
      ok = true;
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#c7d2fe,_transparent_45%),linear-gradient(to_bottom,_#eef2ff,_#f8fafc)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {ok ? (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-2xl">✅</div>
            <h1 className="text-xl font-bold text-slate-900">
              {alreadyVerified ? "E-mail já confirmado" : "E-mail confirmado!"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sua conta está verificada. Você já pode entrar normalmente no TicketFlow.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-2xl">⚠️</div>
            <h1 className="text-xl font-bold text-slate-900">Link inválido ou expirado</h1>
            <p className="mt-2 text-sm text-slate-600">
              Não foi possível confirmar este e-mail. O link pode já ter sido utilizado.
            </p>
          </>
        )}
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Ir para o login
        </Link>
      </div>
    </main>
  );
}
