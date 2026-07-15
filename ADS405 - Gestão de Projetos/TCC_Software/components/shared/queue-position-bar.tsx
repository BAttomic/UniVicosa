// Barra de acompanhamento da fila de pré-venda, exibida dentro da plataforma
// (não por e-mail): mostra a posição da conta e o total da fila. O preenchimento
// representa a proximidade da sua vez — cheio = você é o próximo.
type QueuePositionBarProps = {
  position: number;
  total: number;
  /** true quando as vendas já abriram (mostra o texto de prioridade). */
  opened?: boolean;
};

export function QueuePositionBar({ position, total, opened = false }: QueuePositionBarProps) {
  const safeTotal = Math.max(total, position, 1);
  const ahead = Math.max(0, position - 1);
  const behind = Math.max(0, safeTotal - position);
  const pct = Math.round(((safeTotal - position + 1) / safeTotal) * 100);

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-emerald-800">
          {opened ? "Sua prioridade na fila" : "Sua posição na fila"}
        </span>
        <span className="text-sm text-emerald-700">
          <b className="text-2xl font-black text-emerald-700">Nº {position}</b> de {safeTotal}
        </span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-emerald-100" role="progressbar" aria-valuenow={position} aria-valuemin={1} aria-valuemax={safeTotal}>
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-1.5 flex justify-between text-xs text-emerald-700">
        <span>{ahead === 0 ? "Você é o próximo" : `${ahead} pessoa(s) à sua frente`}</span>
        <span>{behind} atrás • {safeTotal} na fila</span>
      </div>

      <p className="mt-2 text-xs text-emerald-700">
        {opened
          ? "As vendas abriram — finalize sua compra respeitando a ordem de chegada."
          : "Acompanhe sua posição aqui na plataforma. Quando as vendas abrirem, você terá prioridade pela ordem de chegada."}
      </p>
    </div>
  );
}
