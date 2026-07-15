"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOST_PACKAGES } from "@/lib/boost-packages";
import type { BoostActionState } from "@/server/actions/boost.actions";

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const initialState: BoostActionState = { ok: false, message: "" };

export function BoostForm({
  action,
}: {
  action: (state: BoostActionState, formData: FormData) => Promise<BoostActionState>;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selected, setSelected] = useState<string>("avancado");

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [router, state.ok]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <input type="hidden" name="packageId" value={selected} />

      <div className="grid gap-3">
        {BOOST_PACKAGES.map((pkg) => {
          const active = selected === pkg.id;
          return (
            <button
              type="button"
              key={pkg.id}
              onClick={() => setSelected(pkg.id)}
              className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition ${
                active ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{pkg.label}</p>
                <p className="text-sm text-slate-600">{pkg.reach}</p>
                <p className="mt-1 text-xs text-slate-400">{pkg.hint}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-black text-slate-950">{brl(pkg.amount)}</p>
                {active ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                    <Check className="h-3 w-3" /> Selecionado
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <Button type="submit" disabled={pending} className="w-full gap-2">
        <Rocket className="h-4 w-4" />
        {pending ? "Processando pagamento..." : "Impulsionar agora"}
      </Button>
      <p className="text-center text-xs text-slate-400">Pagamento simulado — confirma na hora, como o checkout de ingressos.</p>
    </form>
  );
}
