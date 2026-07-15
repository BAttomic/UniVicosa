import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { DataExportButton } from "@/components/shared/data-export-button";
import { ManageCookiesButton } from "@/components/shared/manage-cookies-button";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShieldCheck,
  Cookie,
  Database,
  Download,
  Pencil,
  Trash2,
  Mail,
  ScrollText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacidade e LGPD • TicketFlow",
  description: "Política de privacidade, uso de cookies e como exercer seus direitos pela LGPD.",
};

const DPO_EMAIL = "privacidade@ticketflow.com";

const collectedData = [
  { label: "Identificação", value: "Nome e e-mail informados no cadastro." },
  { label: "Contato", value: "Telefone (opcional), usado apenas para comunicações sobre seus pedidos." },
  { label: "Transações", value: "Pedidos e ingressos vinculados à sua conta." },
  { label: "Acesso", value: "Cookie de sessão para manter o login (autenticação)." },
];

const cookies = [
  { name: "authjs.session-token", purpose: "Mantém você autenticado durante a navegação.", type: "Essencial", duration: "Sessão (1h)" },
  { name: "tf_cookie_consent", purpose: "Guarda a sua preferência de consentimento de cookies.", type: "Essencial", duration: "12 meses" },
];

const rights = [
  "Confirmação da existência de tratamento e acesso aos dados",
  "Correção de dados incompletos, inexatos ou desatualizados",
  "Portabilidade dos dados (exportação em formato legível)",
  "Eliminação dos dados pessoais tratados com o seu consentimento",
  "Revogação do consentimento a qualquer momento",
];

export default async function PrivacyPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para a página inicial
      </Link>

      <header className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-amber-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Central de privacidade</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Privacidade e LGPD</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Tratamos seus dados conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Aqui você vê o que
          coletamos, quais cookies usamos e como exercer seus direitos.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* Dados coletados */}
      <Section icon={<Database className="h-5 w-5 text-slate-500" />} title="Dados que coletamos">
        <dl className="divide-y divide-slate-100">
          {collectedData.map((item) => (
            <div key={item.label} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[180px_1fr]">
              <dt className="text-sm font-semibold text-slate-900">{item.label}</dt>
              <dd className="text-sm text-slate-600">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Cookies */}
      <Section icon={<Cookie className="h-5 w-5 text-amber-500" />} title="Cookies que usamos">
        <p className="mb-4 text-sm text-slate-600">
          Usamos apenas cookies essenciais. Não utilizamos cookies de publicidade ou rastreamento de terceiros.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 font-semibold">Cookie</th>
                <th className="px-4 py-2 font-semibold">Finalidade</th>
                <th className="px-4 py-2 font-semibold">Tipo</th>
                <th className="px-4 py-2 font-semibold">Duração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cookies.map((cookie) => (
                <tr key={cookie.name}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{cookie.name}</td>
                  <td className="px-4 py-3 text-slate-600">{cookie.purpose}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{cookie.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{cookie.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <ManageCookiesButton />
        </div>
      </Section>

      {/* Direitos */}
      <Section icon={<ScrollText className="h-5 w-5 text-slate-500" />} title="Seus direitos">
        <ul className="space-y-2">
          {rights.map((right) => (
            <li key={right} className="flex items-start gap-2 text-sm text-slate-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {right}
            </li>
          ))}
        </ul>
      </Section>

      {/* Requisições */}
      <Section icon={<Mail className="h-5 w-5 text-slate-500" />} title="Fazer uma solicitação">
        {isLoggedIn ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <RequestCard icon={<Download className="h-5 w-5 text-sky-600" />} title="Acessar / portar" description="Baixe todos os seus dados em JSON.">
              <DataExportButton />
            </RequestCard>
            <RequestCard icon={<Pencil className="h-5 w-5 text-amber-600" />} title="Corrigir" description="Atualize nome e telefone no seu perfil.">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/perfil"><Pencil className="h-4 w-4" /> Editar perfil</Link>
              </Button>
            </RequestCard>
            <RequestCard icon={<Trash2 className="h-5 w-5 text-rose-600" />} title="Excluir" description="Remova permanentemente sua conta e dados.">
              <Button asChild variant="outline" className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50">
                <Link href="/perfil"><Trash2 className="h-4 w-4" /> Excluir conta</Link>
              </Button>
            </RequestCard>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              Entre na sua conta para exportar, corrigir ou excluir seus dados diretamente. Você também pode enviar uma
              solicitação para o nosso encarregado de dados (DPO):
            </p>
            <a href={`mailto:${DPO_EMAIL}`} className="mt-2 inline-flex items-center gap-2 font-medium text-slate-900 underline underline-offset-2">
              <Mail className="h-4 w-4" /> {DPO_EMAIL}
            </a>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Criar conta</Link>
              </Button>
            </div>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Dúvidas sobre privacidade? Fale com o encarregado de dados (DPO):{" "}
          <a href={`mailto:${DPO_EMAIL}`} className="underline underline-offset-2">{DPO_EMAIL}</a>.
        </p>
      </Section>
      </div>
    </main>
  );
}

function Section({ icon, title, children, className = "" }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function RequestCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className="flex-1 text-xs text-slate-500">{description}</p>
      {children}
    </div>
  );
}
