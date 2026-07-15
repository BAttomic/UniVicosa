<h1 align="center">🎟️ TicketFlow</h1>

<p align="center">
  Plataforma web full-stack para <b>venda de ingressos online</b>: qualquer pessoa cria e gerencia eventos,
  vende ingressos com <b>QR Code dinâmico</b> e faz <b>check-in — inclusive offline</b>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/NextAuth-v5-000000?logo=auth0&logoColor=white" alt="NextAuth"/>
  <img src="https://img.shields.io/badge/Tailwind-shadcn/ui-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-6E9F18?logo=vitest&logoColor=white" alt="Tests"/>
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker"/>
</p>

> 📄 Este é o **software do TCC**. A monografia (LaTeX) está em **[`../TCC_Source`](../TCC_Source)** e o PDF compilado em [`public/tcc.pdf`](public/tcc.pdf).

---

## 📸 Telas

| Home pública | Página de evento |
|:---:|:---:|
| ![Home](public/apresentacao-assets/01-home.png) | ![Evento](public/apresentacao-assets/03-evento-detalhe.png) |
| **Check-in (scanner QR + offline)** | **Analytics da plataforma** |
| ![Check-in](public/apresentacao-assets/07-checkin.png) | ![Analytics](public/apresentacao-assets/12-analytics.png) |

<p align="center">
  <img src="public/apresentacao-assets/mobile-ticket.png" width="260" alt="Ingresso mobile com QR dinâmico"/><br/>
  <sub>Ingresso no celular com <b>QR renovado a cada 30s</b> (anti-print).</sub>
</p>

## ✨ O que faz

- **Eventos**: criação/gestão pública, capas, eventos em **destaque** (patrocinados) com prioridade na home.
- **Ingressos**: lotes programados, fila de espera, checkout com **taxa de serviço de 5%** e **QR dinâmico** (HMAC rotativo, com titular e CPF ocultável).
- **Check-in**: scanner QR com **modo offline** (cache + fila + sincronização) e lista de compradores em CSV.
- **Analytics**: faturamento, GMV, ticket médio e tendências com intervalos (semana/mês/ano/total + período custom).
- **Privacidade/LGPD**: consentimento de cookies, central em `/privacidade`, exportar dados (JSON), corrigir perfil e excluir conta.
- **Segurança**: middleware com headers de segurança + proteção de rotas; health endpoint com verificação de DB.

## 💰 Modelo de negócio

Criar conta e organizar eventos é **gratuito**. A plataforma monetiza por:
- **Taxa de serviço de 5%** sobre as vendas (paga pelo comprador; repasse de 100% ao organizador).
- **Destaque/promoção** de eventos (patrocinados ganham posição na home e na listagem).

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + Turbopack |
| Linguagem | TypeScript (strict) |
| Dados | MongoDB + Mongoose |
| UI | TailwindCSS + shadcn/ui |
| Auth | NextAuth v5 (Credentials + JWT) |
| Testes | Vitest (unitário) + Playwright (e2e) |
| Deploy | Docker (multi-stage, Next standalone) |

## 🏗️ Arquitetura

Domínio organizado em **módulos** (`modules/<domínio>`) com modelos, repositórios e schemas próprios; a aplicação chega via **Server Actions** e **Route Handlers**.

```mermaid
flowchart TD
  UI[Next.js App Router · RSC + Client] --> SA[Server Actions]
  UI --> API[Route Handlers /api]
  SA --> Mods{{Módulos de domínio}}
  API --> Mods
  Mods --> Events[events]
  Mods --> Tickets[tickets]
  Mods --> Orders[orders]
  Mods --> Identity[identity]
  Mods --> Audit[audit]
  Events & Tickets & Orders & Identity & Audit --> Repo[Repositories]
  Repo --> DB[(MongoDB · Mongoose)]
  UI -. sessão .-> Auth[NextAuth v5 · JWT]
  Tickets -. QR HMAC rotativo .-> QR[TICKET_HMAC_SECRET]
```

## 👥 Papéis (acesso por evento)

O acesso global é apenas **usuário** ou **admin**. Qualquer usuário cria eventos (virando organizador) e adiciona operadores por evento (`EventStaff`).
- **usuário** — compra ingressos, cria/gerencia os próprios eventos e faz check-in onde é organizador/operador.
- **operador (por evento)** — check-in e download de compradores daquele evento.
- **admin** — gerencia todos os eventos e usuários; analytics e cortesias.

## ▶️ Como rodar

```bash
pnpm install
cp .env.example .env.local     # preencha ao menos MONGODB_URI
pnpm seed                       # popula o cenário de exemplo (Viçosa)
pnpm dev                        # http://localhost:3000
```

**Requisitos:** Node.js 20+ · pnpm · uma instância de MongoDB.

<details>
<summary>📜 Scripts principais</summary>

| Comando | O que faz |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Dev com hot reload / build de produção / servir build |
| `pnpm typecheck` / `pnpm lint` / `pnpm lint:fix` | Type-check e lint |
| `pnpm test` / `pnpm test:watch` / `pnpm test:e2e` | Vitest (unitário) e Playwright (e2e) |
| `pnpm seed` / `pnpm seed:vicosa` / `pnpm seed:brasil` | Popula dados (**limpa e recria**) |
| `pnpm db:reset` | Reseta as coleções |

> ⚠️ Os `seed`/`db:reset` **apagam e recriam** os dados — use apenas em base de desenvolvimento.
</details>

<details>
<summary>🔑 Variáveis de ambiente & contas de teste</summary>

**Obrigatórias:** `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `JWT_SECRET`, `TICKET_HMAC_SECRET`
**Opcionais:** `RESEND_API_KEY` (e-mail), `STRIPE_SECRET_KEY` (o checkout atual é simulado). Lista completa em `.env.example`.

**Contas do seed** (senha `Password123!`):
- `admin@ticketflow.com` — admin
- `organizer1@ticketflow.com` — organizador
- `operator@ticketflow.com` — operador
- `buyer1@ticketflow.com` — comprador (com pedidos e ingressos)
</details>

## 📄 Documentação

Plano de projeto completo (arquitetura, requisitos, escopo, cronograma e custos) em [`TCC.md`](TCC.md).

---

<p align="center">
  <sub>📚 <b>ADS405 — Gestão de Projetos</b> · Análise e Desenvolvimento de Sistemas — UniViçosa</sub><br/>
  <sub>Parte do repositório-portfólio <a href="../../">UniVicosa</a> · Curso concluído 🎓 · 👤 Bernardo Cordeiro Motta</sub>
</p>
