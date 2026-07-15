"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { WaitlistActionState } from "@/server/actions/waitlist.actions";
import { Button } from "@/components/ui/button";
import { QueuePositionBar } from "@/components/shared/queue-position-bar";

type WaitlistFormProps = {
  action: (state: WaitlistActionState, formData: FormData) => Promise<WaitlistActionState>;
  /** Sessão ativa? A fila é por conta — quem não está logado é direcionado ao login. */
  isLoggedIn: boolean;
  loginHref?: string;
};

const initialState: WaitlistActionState = { ok: false, message: "" };

export function WaitlistForm({ action, isLoggedIn, loginHref = "/login" }: WaitlistFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.ok && typeof state.position === "number" && typeof state.total === "number") {
    return <QueuePositionBar position={state.position} total={state.total} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">A fila de pré-venda é por conta. Entre para garantir a sua posição.</p>
        <Button asChild className="w-full">
          <Link href={loginHref}>Entrar para entrar na fila</Link>
        </Button>
      </div>
    );
  }

  // Sem pedir nome/e-mail/telefone — já temos os dados da conta logada.
  return (
    <form className="space-y-3" action={formAction}>
      {state.message ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.message}</div>
      ) : null}
      <p className="text-sm text-slate-600">Entramos com os dados da sua conta — nada a preencher.</p>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Entrando na fila..." : "Entrar na fila com minha conta"}
      </Button>
    </form>
  );
}
