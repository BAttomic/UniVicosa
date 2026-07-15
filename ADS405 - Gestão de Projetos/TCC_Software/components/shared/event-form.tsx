"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/server/actions/events.actions";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EventFormValues = {
  title: string;
  slug: string;
  description: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  startsAt: string;
  endsAt: string;
  coverImageUrl: string;
  featured: boolean;
  status: "draft" | "published" | "cancelled" | "finished";
};

type EventFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues: EventFormValues;
};

const initialState: ActionState = { ok: false, message: "" };

export function EventForm({ action, submitLabel, defaultValues }: EventFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [router, state.ok, state.redirectTo]);

  return (
    <form className="space-y-5" action={formAction}>
      {state.message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titulo" name="title" defaultValue={defaultValues.title} />
        <Field label="Slug" name="slug" defaultValue={defaultValues.slug} placeholder="automatico se vazio" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="description">
          Descricao
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues.description}
          className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome do local" name="venueName" defaultValue={defaultValues.venueName} />
        <Field label="Endereco" name="venueAddress" defaultValue={defaultValues.venueAddress} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Cidade" name="venueCity" defaultValue={defaultValues.venueCity} />
        <Field label="Estado" name="venueState" defaultValue={defaultValues.venueState} maxLength={2} />
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues.status}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="cancelled">Cancelado</option>
            <option value="finished">Finalizado</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Inicio" name="startsAt" type="datetime-local" defaultValue={defaultValues.startsAt} />
        <Field label="Termino" name="endsAt" type="datetime-local" defaultValue={defaultValues.endsAt} />
      </div>

      <Field label="Imagem de capa" name="coverImageUrl" defaultValue={defaultValues.coverImageUrl} placeholder="https://..." />

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-slate-700">
        <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <span>
          <strong className="text-slate-900">Quer mais alcance?</strong>
          <span className="mt-0.5 block text-xs text-slate-500">
            Depois de salvar, use <strong>Impulsionar evento</strong> na lista de eventos para destacar este evento na
            home e na busca.
          </span>
        </span>
      </div>

      <Button className="w-full md:w-auto" disabled={pending} type="submit">
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} maxLength={maxLength} />
    </div>
  );
}