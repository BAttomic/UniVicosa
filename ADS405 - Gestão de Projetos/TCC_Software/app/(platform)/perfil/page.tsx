import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findByIdWithCpf } from "@/modules/identity/repositories/user.repository";
import { updateProfileAction, changePasswordAction, changeEmailAction } from "@/server/actions/profile.actions";
import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { DataExportButton } from "@/components/shared/data-export-button";
import { DeleteAccountButton } from "@/components/shared/delete-account-button";
import { ManageCookiesButton } from "@/components/shared/manage-cookies-button";
import { Button } from "@/components/ui/button";
import {
  User,
  Lock,
  Mail,
  ShieldAlert,
  FileJson,
  ShieldCheck,
  IdCard,
  CalendarDays,
  Building2,
  MapPin,
  KeyRound,
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await requireRole(["buyer", "organizer", "operator", "admin"]);
  await connectDB();

  const { status } = await searchParams;
  const user = await findByIdWithCpf(session.user.id);

  if (!user) {
    return <main className="p-10 text-center text-slate-500">Usuário não encontrado.</main>;
  }

  const isAdmin = user.role === "admin";
  const organizer = user.organizerProfile;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-8 sm:px-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-black text-amber-400">
            {user.name?.slice(0, 1).toUpperCase() ?? "U"}
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Conta</p>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            {/* E-mail abaixo do nome, com opção de alterar (substitui o antigo "Perfil: role") */}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
              <a href="#email" className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-amber-300 transition hover:bg-white/20">
                Alterar e-mail
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <HeaderBadge>{isAdmin ? "Administrador" : "Usuário"}</HeaderBadge>
          {organizer ? <HeaderBadge>Organizador {organizer.personType === "pj" ? "PJ" : "PF"}</HeaderBadge> : null}
          <HeaderBadge>Desde {formatBR(new Date(user.createdAt), "MMM 'de' yyyy")}</HeaderBadge>
        </div>
      </div>

      {status && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {status}
        </div>
      )}

      {/* Linha 1 — três cartões simétricos */}
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        {/* Informações pessoais */}
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-950">Informações pessoais</h2>
          </div>
          <form action={updateProfileAction} className="flex flex-1 flex-col gap-4">
            <Field label="Nome completo" name="name" defaultValue={user.name} required />
            <Field label="Telefone" name="phone" type="tel" defaultValue={user.phone ?? ""} placeholder="(31) 99999-9999" />
            <Field label="CPF" name="cpf" defaultValue={user.cpf ?? ""} placeholder="000.000.000-00" hint="Usado para emissão de ingressos nominais." />
            <Button type="submit" className="mt-auto">Salvar alterações</Button>
          </form>
        </section>

        {/* E-mail e acesso */}
        <section id="email" className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-950">E-mail e acesso</h2>
          </div>
          <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">E-mail atual</p>
            <p className="font-medium text-slate-900">{user.email}</p>
          </div>
          <form action={changeEmailAction} className="flex flex-1 flex-col gap-4">
            <Field label="Novo e-mail" name="email" type="email" placeholder="novo@email.com" required />
            <Field label="Senha atual (confirmação)" name="currentPassword" type="password" placeholder="Confirme com sua senha" required />
            <Button type="submit" variant="outline" className="mt-auto gap-2">
              <KeyRound className="h-4 w-4" /> Atualizar e-mail
            </Button>
          </form>
        </section>

        {/* Alterar senha */}
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-950">Alterar senha</h2>
          </div>
          <form action={changePasswordAction} className="flex flex-1 flex-col gap-4">
            <Field label="Senha atual" name="currentPassword" type="password" required />
            <Field label="Nova senha" name="newPassword" type="password" placeholder="Mínimo 8 caracteres" required />
            <Button type="submit" variant="outline" className="mt-auto">Alterar senha</Button>
          </form>
        </section>
      </div>

      {/* Dados do organizador (quando houver) */}
      {organizer ? (
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-950">Dados do organizador</h2>
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {organizer.personType === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info icon={<IdCard className="h-4 w-4" />} label={organizer.personType === "pj" ? "Razão social" : "Nome"} value={organizer.legalName} />
            {organizer.tradeName ? <Info icon={<Building2 className="h-4 w-4" />} label="Nome fantasia" value={organizer.tradeName} /> : null}
            <Info icon={<IdCard className="h-4 w-4" />} label={organizer.personType === "pj" ? "CNPJ" : "CPF"} value={organizer.document} />
            <Info icon={<User className="h-4 w-4" />} label="Responsável" value={organizer.responsibleName} />
            <Info icon={<CalendarDays className="h-4 w-4" />} label="Telefone comercial" value={organizer.phone} />
            <Info icon={<KeyRound className="h-4 w-4" />} label="Chave PIX (repasses)" value={organizer.pixKey ?? "—"} />
            <Info
              icon={<MapPin className="h-4 w-4" />}
              label="Endereço"
              value={`${organizer.address.street}, ${organizer.address.number}${organizer.address.complement ? ` - ${organizer.address.complement}` : ""}`}
            />
            <Info icon={<MapPin className="h-4 w-4" />} label="Cidade / UF" value={`${organizer.address.district}, ${organizer.address.city} - ${organizer.address.state} • ${organizer.address.cep}`} />
          </div>
        </section>
      ) : null}

      {/* Linha 2 — LGPD + zona de perigo */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FileJson className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-950">Seus dados (LGPD)</h2>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a acessar, corrigir e
            solicitar a exclusão dos seus dados pessoais.
          </p>
          <div className="mt-auto flex flex-wrap gap-3">
            <DataExportButton />
            <ManageCookiesButton />
            <Button asChild variant="ghost" className="gap-2 text-slate-600">
              <Link href="/privacidade">
                <ShieldCheck className="h-4 w-4" />
                Central de privacidade
              </Link>
            </Button>
          </div>
        </section>

        <section className="flex flex-col rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <h2 className="text-lg font-bold text-rose-800">Zona de perigo</h2>
          </div>
          <p className="mb-4 text-sm text-rose-700">
            Excluir sua conta remove permanentemente todos os seus dados, pedidos e ingressos. Esta ação é irreversível.
          </p>
          <div className="mt-auto">
            <DeleteAccountButton />
          </div>
        </section>
      </div>
    </main>
  );
}

function HeaderBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">{children}</span>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon} {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500"
      />
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
