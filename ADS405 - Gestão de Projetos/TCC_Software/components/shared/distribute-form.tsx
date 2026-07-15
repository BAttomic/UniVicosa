"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/server/actions/events.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TicketTypeOption = { id: string; name: string; available: number };

const initialState: ActionState = { ok: false, message: "" };

export function DistributeForm({
  action,
  ticketTypes,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  ticketTypes: TicketTypeOption[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  const hasTypes = ticketTypes.length > 0;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          E-mail do destinatário
        </label>
        <Input id="email" name="email" type="email" required placeholder="usuario@exemplo.com" />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="ticketTypeId">
            Tipo de ingresso
          </label>
          <select
            id="ticketTypeId"
            name="ticketTypeId"
            required
            disabled={!hasTypes}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {!hasTypes && <option value="">Nenhum ingresso cadastrado</option>}
            {ticketTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.available} disponíveis)
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="quantity">
            Quantidade
          </label>
          <Input id="quantity" name="quantity" type="number" min={1} max={50} defaultValue={1} required />
        </div>
      </div>

      <Button type="submit" disabled={pending || !hasTypes} className="w-full sm:w-auto">
        {pending ? "Enviando cortesia..." : "Enviar cortesia"}
      </Button>
    </form>
  );
}
