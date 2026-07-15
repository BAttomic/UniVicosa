"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Ticket,
  ShoppingBag,
  CalendarDays,
  Users,
  QrCode,
  User,
  LogOut,
  LayoutDashboard,
  LineChart,
  Menu,
  X,
} from "lucide-react";

type NavProps = {
  isAdmin: boolean;
  canCheckin: boolean;
  name: string;
};

type NavLink = { href: string; label: string; icon: typeof Ticket };

function getLinks({ isAdmin, canCheckin }: { isAdmin: boolean; canCheckin: boolean }): NavLink[] {
  const links: NavLink[] = [
    { href: "/eventos", label: "Eventos", icon: CalendarDays },
    { href: "/organizer/eventos", label: isAdmin ? "Gerenciar eventos" : "Meus eventos", icon: LayoutDashboard },
  ];

  if (canCheckin) {
    links.push({ href: "/checkin", label: "Check-in", icon: QrCode });
  }

  if (isAdmin) {
    links.push(
      { href: "/admin/analytics", label: "Analytics", icon: LineChart },
      { href: "/admin/usuarios", label: "Usuários", icon: Users },
    );
  }

  // Admin é um papel administrativo (não compra ingressos), então não vê
  // "Meus ingressos" nem "Pedidos".
  if (!isAdmin) {
    links.push(
      { href: "/tickets", label: "Meus ingressos", icon: Ticket },
      { href: "/orders", label: "Pedidos", icon: ShoppingBag },
    );
  }

  links.push({ href: "/perfil", label: "Perfil", icon: User });

  return links;
}

export function Nav({ isAdmin, canCheckin, name }: NavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = getLinks({ isAdmin, canCheckin });

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-950">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-950 text-xs font-black text-amber-400">TF</span>
            TicketFlow
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-slate-500 lg:block">
            {name} • <span className="font-medium">{isAdmin ? "admin" : "usuário"}</span>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="hidden items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:flex"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex w-full max-w-[96rem] flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
