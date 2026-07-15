import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-950">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-950 text-xs font-black text-amber-400">TF</span>
            TicketFlow
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/eventos"
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              <CalendarDays className="h-4 w-4" />
              Eventos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" className="rounded-xl text-slate-700">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href="/register">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
