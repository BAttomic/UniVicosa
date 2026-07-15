import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBR } from "@/lib/date-br";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutForm } from "@/components/shared/checkout-form";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findBySlug } from "@/modules/events/repositories/event.repository";
import { findActiveByTicketTypeId } from "@/modules/events/repositories/lot.repository";
import { findByEventId } from "@/modules/events/repositories/ticket-type.repository";
import { createCheckoutAction } from "@/server/actions/events.actions";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  await connectDB();

  const event = await findBySlug(slug);
  if (!event) {
    notFound();
  }

  const session = await auth();
  const ticketTypes = await findByEventId(event._id);
  const options: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    maxPerOrder: number;
    quantityLeft: number;
    lotName?: string;
  }> = [];

  for (const ticketType of ticketTypes) {
    const lot = (await findActiveByTicketTypeId(ticketType._id))[0];
    if (!lot) {
      continue;
    }

    options.push({
      id: ticketType._id,
      name: ticketType.name,
      description: ticketType.description,
      price: lot.price ?? ticketType.price,
      maxPerOrder: ticketType.maxPerOrder,
      quantityLeft: Math.max(0, Math.min(ticketType.totalQuantity - ticketType.soldQuantity, lot.quantity - lot.soldQuantity)),
      lotName: lot.name,
    });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Checkout prototipo</p>
        <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>
        <p className="mt-2 text-slate-300">{formatBR(new Date(event.startsAt), "dd 'de' MMMM 'de' yyyy, HH:mm")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Escolha seu ingresso</CardTitle>
            <CardDescription>O pedido sera criado como prototipo e pode ser marcado como pago na mesma etapa.</CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <CheckoutForm
                action={createCheckoutAction}
                options={options}
                defaultPayer={{ name: session.user?.name ?? "", email: session.user?.email ?? "" }}
              />
            ) : (
              <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
                <p>Entre para testar a compra e a simulacao de pagamento.</p>
                <Button asChild>
                  <Link href={`/login?callbackUrl=/eventos/${event.slug}/checkout`}>Entrar para comprar</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Opcoes disponiveis</CardTitle>
            <CardDescription>Preços por ingresso. Uma taxa de serviço de 5% é somada ao total no checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((option) => (
              <div key={option.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{option.name}</p>
                    <p className="text-sm text-slate-600">{option.lotName}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">R$ {(option.price / 100).toFixed(2).replace(".", ",")}</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">Disponiveis: {option.quantityLeft}</p>
                {option.description ? <p className="mt-2 text-sm text-slate-500">{option.description}</p> : null}
              </div>
            ))}

            {options.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Nao ha lotes ativos para compra agora.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}