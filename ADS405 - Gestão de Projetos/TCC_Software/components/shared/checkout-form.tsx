"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/server/actions/events.actions";
import { PLATFORM_FEE_LABEL, priceBreakdown } from "@/lib/fees";
import { formatCpf, formatPhoneBR, isValidCpf } from "@/lib/br-validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TicketOption = {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxPerOrder: number;
  quantityLeft: number;
  lotName?: string;
};

type CheckoutFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  options: TicketOption[];
  defaultPayer?: { name?: string; email?: string };
};

const initialState: ActionState = { ok: false, message: "" };

const paymentMethods = [
  { value: "pix", label: "PIX", hint: "Aprovação imediata via QR Code." },
  { value: "credit_card", label: "Cartão de crédito", hint: "Em até 12x (simulado)." },
  { value: "boleto", label: "Boleto bancário", hint: "Compensa em até 2 dias úteis." },
] as const;

function brl(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function maxFor(option: TicketOption) {
  return Math.max(0, Math.min(option.maxPerOrder ?? 5, option.quantityLeft));
}

export function CheckoutForm({ action, options, defaultPayer }: CheckoutFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<(typeof paymentMethods)[number]["value"]>("pix");

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.refresh();
    }
  }, [router, state.ok, state.redirectTo]);

  function setQty(option: TicketOption, value: number) {
    const max = maxFor(option);
    const next = Math.max(0, Math.min(max, Math.floor(value) || 0));
    setQuantities((prev) => ({ ...prev, [option.id]: next }));
  }

  const cartItems = useMemo(
    () =>
      options
        .map((option) => ({ ticketTypeId: option.id, quantity: quantities[option.id] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [options, quantities],
  );

  const subtotal = useMemo(
    () => options.reduce((sum, option) => sum + option.price * (quantities[option.id] ?? 0), 0),
    [options, quantities],
  );
  const breakdown = priceBreakdown(subtotal);
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cpfTouched = cpf.replace(/\D/g, "").length >= 11;
  const cpfInvalid = cpfTouched && !isValidCpf(cpf);

  if (options.length === 0) {
    return <p className="text-sm text-slate-600">Nao ha ingressos ativos para este evento.</p>;
  }

  return (
    <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" action={formAction}>
      {state.message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {state.message}
          {state.orderId ? <div className="mt-1 text-xs">Pedido: {state.orderId}</div> : null}
        </div>
      ) : null}

      {/* --- Ingressos (carrinho de múltiplos tipos) --- */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Ingressos</legend>
        <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
        {options.map((option) => {
          const max = maxFor(option);
          const qty = quantities[option.id] ?? 0;
          const soldOut = max <= 0;
          return (
            <div key={option.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {option.name}
                  {option.lotName ? <span className="text-slate-400"> · {option.lotName}</span> : null}
                </p>
                <p className="text-xs text-slate-500">
                  {brl(option.price)} · {soldOut ? "esgotado" : `${option.quantityLeft} disponíveis`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`Diminuir ${option.name}`}
                  onClick={() => setQty(option, qty - 1)}
                  disabled={qty <= 0}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  max={max}
                  value={qty}
                  onChange={(event) => setQty(option, Number(event.target.value))}
                  disabled={soldOut}
                  className="h-9 w-14 rounded-md border border-input bg-background text-center text-sm"
                />
                <button
                  type="button"
                  aria-label={`Aumentar ${option.name}`}
                  onClick={() => setQty(option, qty + 1)}
                  disabled={qty >= max}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </fieldset>

      {/* --- Dados do titular (obrigatórios no Brasil para emissão do ingresso) --- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Dados do titular</legend>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="payerName">Nome completo</label>
          <Input id="payerName" name="payerName" required minLength={3} defaultValue={defaultPayer?.name ?? ""} placeholder="Como no documento" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="payerCpf">CPF</label>
            <Input
              id="payerCpf"
              name="payerCpf"
              required
              inputMode="numeric"
              value={cpf}
              onChange={(event) => setCpf(formatCpf(event.target.value))}
              placeholder="000.000.000-00"
              aria-invalid={cpfInvalid}
            />
            {cpfInvalid ? <p className="text-xs text-rose-600">CPF inválido.</p> : null}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="payerPhone">Telefone</label>
            <Input
              id="payerPhone"
              name="payerPhone"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhoneBR(event.target.value))}
              placeholder="(31) 99999-9999"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="payerEmail">E-mail</label>
          <Input id="payerEmail" name="payerEmail" type="email" required defaultValue={defaultPayer?.email ?? ""} placeholder="voce@email.com" />
        </div>
      </fieldset>

      {/* --- Pagamento (simulado) --- */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Pagamento</legend>
        <input type="hidden" name="paymentMethod" value={payment} />
        <div className="grid gap-2 sm:grid-cols-3">
          {paymentMethods.map((method) => (
            <button
              type="button"
              key={method.value}
              onClick={() => setPayment(method.value)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                payment === method.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <span className="block font-medium">{method.label}</span>
              <span className={`block text-xs ${payment === method.value ? "text-slate-200" : "text-slate-500"}`}>{method.hint}</span>
            </button>
          ))}
        </div>

        {payment === "credit_card" ? (
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="cardNumber">Número do cartão</label>
              <Input id="cardNumber" inputMode="numeric" placeholder="0000 0000 0000 0000" autoComplete="cc-number" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="cardExpiry">Validade</label>
              <Input id="cardExpiry" placeholder="MM/AA" autoComplete="cc-exp" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="cardCvv">CVV</label>
              <Input id="cardCvv" inputMode="numeric" placeholder="123" autoComplete="cc-csc" />
            </div>
            <p className="text-xs text-slate-500 sm:col-span-2">
              Ambiente de demonstração: nenhum dado de cartão é transmitido ou armazenado.
            </p>
          </div>
        ) : null}

        {payment === "pix" ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-slate-300 bg-white text-[10px] text-slate-400">QR PIX</div>
            <p>Ao confirmar, geramos um QR Code PIX simulado e o pedido é aprovado automaticamente.</p>
          </div>
        ) : null}
      </fieldset>

      {/* Buyer-facing price breakdown (ticket price + 5% service fee) */}
      <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{brl(breakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Taxa de serviço ({PLATFORM_FEE_LABEL})</span>
          <span>{brl(breakdown.serviceFee)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold text-slate-900">
          <span>Total</span>
          <span>{brl(breakdown.total)}</span>
        </div>
      </div>

      <p className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600">
        O pedido será aprovado automaticamente em 20 segundos.
      </p>

      <Button className="w-full" disabled={pending || cpfInvalid || totalQty === 0} type="submit">
        {pending
          ? "Processando..."
          : totalQty === 0
            ? "Selecione um ingresso"
            : `Pagar ${brl(breakdown.total)} · ${totalQty} ingresso(s)`}
      </Button>
    </form>
  );
}
