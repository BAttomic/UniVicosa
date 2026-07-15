"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResendState } from "@/server/actions/orders.actions";

const initial: ResendState = { ok: false, message: "" };

export function ResendEmailButton({
  action,
}: {
  action: (state: ResendState, formData: FormData) => Promise<ResendState>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-2">
      <Button type="submit" variant="outline" disabled={pending} className="gap-2">
        <Mail className="h-4 w-4" />
        {pending ? "Enviando..." : "Reenviar comprovante por e-mail"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
