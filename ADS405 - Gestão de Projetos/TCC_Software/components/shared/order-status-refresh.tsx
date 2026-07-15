"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatusRefreshProps = {
  orderId: string;
  status: string;
};

export function OrderStatusRefresh({ orderId, status }: OrderStatusRefreshProps) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "pending") return;

    async function poll() {
      try {
        const res = await fetch(`/api/orders/${orderId}/process`, { method: "POST" });
        const data = (await res.json()) as { ok: boolean; status: string; remainingSeconds?: number };

        if (data.status !== "pending") {
          router.refresh();
          return;
        }

        setRemaining(data.remainingSeconds ?? null);
      } catch {
        // network error — keep polling
      }
    }

    void poll();
    const timer = setInterval(poll, 8_000);
    return () => clearInterval(timer);
  }, [orderId, status, router]);

  if (status !== "pending") return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
      {remaining !== null && remaining > 0
        ? `Aprovação automática em ${remaining}s…`
        : "Processando pagamento…"}
    </div>
  );
}
