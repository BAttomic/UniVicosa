"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return "•••.•••.•••-••";
  return `•••.•••.•••-${digits.slice(9)}`;
}

// Shows a CPF masked by default with a hide/unhide toggle, so the document is not
// exposed on shared screens unless the holder opts in.
export function CpfReveal({ cpf }: { cpf: string }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-slate-900">{shown ? cpf : maskCpf(cpf)}</span>
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? "Ocultar CPF" : "Mostrar CPF"}
        title={shown ? "Ocultar CPF" : "Mostrar CPF"}
        className="text-slate-400 transition hover:text-slate-700"
      >
        {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}
