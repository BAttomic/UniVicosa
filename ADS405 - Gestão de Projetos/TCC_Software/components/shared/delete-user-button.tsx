"use client";

import { Trash2 } from "lucide-react";

// Icon-only delete with a confirmation step, used in the admin users table. The
// bound server action is passed in from the (server) page.
export function DeleteUserButton({ action, userName }: { action: () => Promise<void>; userName: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Excluir a conta de ${userName}? Esta ação é irreversível e remove pedidos e ingressos vinculados.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        title={`Excluir ${userName}`}
        aria-label={`Excluir ${userName}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
