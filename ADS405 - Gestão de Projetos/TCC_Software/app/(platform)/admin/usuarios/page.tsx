import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { createStaffUserAction, deleteStaffUserAction, updateStaffUserAction } from "@/server/actions/users.actions";
import { findAllUsers } from "@/modules/identity/repositories/user.repository";
import Order from "@/modules/orders/models/order.model";
import { DeleteUserButton } from "@/components/shared/delete-user-button";
import { formatBR } from "@/lib/date-br";
import { ChevronDown, ShieldCheck, UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const roleOptions = ["user", "admin"] as const;

function accessRole(role: string): "user" | "admin" {
  return role === "admin" ? "admin" : "user";
}

function currency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireRole("admin");
  await connectDB();

  const params = await searchParams;
  const users = await findAllUsers();
  const adminCount = users.filter((user) => accessRole(user.role) === "admin").length;

  // Gasto por usuário: soma dos pedidos pagos (excluindo cortesias, que são R$ 0).
  const O = Order as unknown as { aggregate(p: any[]): Promise<any[]> };
  const spentAgg = await O.aggregate([
    { $match: { status: "paid", paymentIntentId: { $not: /^comp_/ } } },
    { $group: { _id: "$buyerId", spent: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
  ]);
  const spentByUser = new Map<string, { spent: number; orders: number }>(
    spentAgg.map((row: any) => [String(row._id), { spent: row.spent ?? 0, orders: row.orders ?? 0 }]),
  );
  const totalSpent = spentAgg.reduce((sum: number, row: any) => sum + (row.spent ?? 0), 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Administração</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Usuários e acessos</h1>
          <p className="mt-1 text-sm text-slate-300">Operadores são definidos por evento, na aba Equipe.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Usuários" value={String(users.length)} />
          <Stat label="Admins" value={String(adminCount)} />
          <Stat label="Comuns" value={String(users.length - adminCount)} />
          <Stat label="Receita (usuários)" value={currency(totalSpent)} />
        </div>
      </div>

      {params.status ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
          {params.status}
        </div>
      ) : null}

      {/* Novo usuário — formulário inline compacto */}
      <details className="group mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900">
          Novo usuário
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <form action={createStaffUserAction} className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Nome" name="name" placeholder="Nome completo" />
          <Field label="E-mail" name="email" type="email" placeholder="email@exemplo.com" />
          <Field label="Senha" name="password" type="password" placeholder="Mínimo 8 caracteres" />
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600" htmlFor="role">Acesso</label>
            <select id="role" name="role" className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm">
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role === "admin" ? "Admin" : "Usuário"}</option>
              ))}
            </select>
          </div>
          <button className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 sm:col-span-2 lg:col-span-4" type="submit">
            Criar usuário
          </button>
        </form>
      </details>

      {/* Tabela de usuários — linhas compactas com edição expansível */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.3fr_1.6fr_0.8fr_0.9fr_auto] gap-3 border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:grid">
          <span>Nome</span>
          <span>E-mail</span>
          <span>Criado em</span>
          <span>Gasto</span>
          <span className="text-right">Acesso</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {users.map((user) => {
            const role = accessRole(user.role);
            const stats = spentByUser.get(String(user._id)) ?? { spent: 0, orders: 0 };
            return (
              <li key={user._id}>
                <details className="group">
                  <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 lg:grid-cols-[1.3fr_1.6fr_0.8fr_0.9fr_auto]">
                    <span className="truncate font-medium text-slate-900">{user.name}</span>
                    <span className="hidden truncate text-slate-600 lg:block">{user.email}</span>
                    <span className="hidden text-slate-500 lg:block">
                      {formatBR(new Date(user.createdAt), "dd/MM/yyyy")}
                    </span>
                    <span className="hidden lg:block">
                      <span className="font-semibold text-slate-900">{currency(stats.spent)}</span>
                      <span className="ml-1 text-xs text-slate-400">({stats.orders} ped.)</span>
                    </span>
                    <span className="flex items-center justify-end gap-2">
                      <RoleBadge role={role} />
                      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>

                  <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                    {/* Resumo móvel (colunas ocultas em telas pequenas) */}
                    <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 lg:hidden">
                      <span className="truncate">{user.email}</span>
                      <span>Criado em {formatBR(new Date(user.createdAt), "dd/MM/yyyy")}</span>
                      <span>Gasto {currency(stats.spent)} ({stats.orders} ped.)</span>
                    </div>

                    <form action={updateStaffUserAction.bind(null, user._id)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Nome" name="name" defaultValue={user.name} />
                      <Field label="E-mail" name="email" type="email" defaultValue={user.email} />
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600" htmlFor={`role-${user._id}`}>Acesso</label>
                        <select id={`role-${user._id}`} name="role" defaultValue={role} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm">
                          {roleOptions.map((option) => (
                            <option key={option} value={option}>{option === "admin" ? "Admin" : "Usuário"}</option>
                          ))}
                        </select>
                      </div>
                      <Field label="Nova senha" name="password" type="password" placeholder="Deixe em branco" />
                      {/* Ações simétricas: salvar (preenche) + excluir (ícone) */}
                      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
                        <button className="h-10 flex-1 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 sm:flex-none sm:px-8" type="submit">
                          Salvar alterações
                        </button>
                        <DeleteUserButton action={deleteStaffUserAction.bind(null, user._id)} userName={user.name} />
                      </div>
                    </form>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[6rem] rounded-2xl bg-white/10 px-4 py-2 text-center">
      <p className="text-xl font-black leading-none">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: "user" | "admin" }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">
        <ShieldCheck className="h-3 w-3" /> Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      <UserRound className="h-3 w-3" /> Usuário
    </span>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600" htmlFor={`${name}-${defaultValue ?? "new"}`}>
        {label}
      </label>
      <input
        id={`${name}-${defaultValue ?? "new"}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500"
      />
    </div>
  );
}
