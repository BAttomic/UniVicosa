# TicketFlow

Plataforma web full-stack para venda de ingressos online. Qualquer pessoa pode
criar e gerenciar eventos, vender ingressos com QR Code dinâmico e fazer
check-in (inclusive offline).

## Stack
- Next.js 16 (App Router) + Turbopack
- TypeScript strict
- MongoDB + Mongoose
- TailwindCSS + shadcn/ui
- NextAuth v5 (Credentials + JWT)
- Vitest (unitário) + Playwright (e2e)

## Modelo de negócio
Criar conta e organizar eventos é gratuito. A plataforma monetiza por:
- **Taxa de serviço de 5%** sobre o valor das vendas — uma das menores do mercado.
- **Destaque/promoção de eventos** dentro da plataforma: eventos patrocinados
  ganham posição de destaque na home e na listagem pública.

## Requisitos
- Node.js 20+
- pnpm
- Uma instância de MongoDB acessível (local ou remota)

## Como rodar
1. Instale as dependências: `pnpm install`
2. Configure o ambiente: copie `.env.example` para `.env.local` e preencha as
   variáveis (principalmente `MONGODB_URI`). O `.env.local` é o arquivo que o app
   e os scripts realmente usam.
3. Popule dados de exemplo: `pnpm seed`
4. Inicie o app: `pnpm dev` (http://localhost:3000)

## Scripts
| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe o servidor de desenvolvimento com hot reload em `localhost:3000`. |
| `pnpm build` | Gera a build de produção (Turbopack) e roda o type-check do Next. |
| `pnpm start` | Sobe a build de produção já gerada (requer `pnpm build` antes). |
| `pnpm typecheck` | Verifica os tipos com `tsc --noEmit` (não gera arquivos). |
| `pnpm lint` | Roda o ESLint em todo o projeto. |
| `pnpm lint:fix` | Roda o ESLint corrigindo automaticamente o que for possível. |
| `pnpm test` | Executa os testes unitários (Vitest) uma única vez. |
| `pnpm test:watch` | Executa os testes unitários em modo watch. |
| `pnpm test:e2e` | Executa os testes end-to-end com Playwright. |
| `pnpm seed` | Popula o banco com o cenário padrão (Viçosa). **Limpa e recria** os dados. |
| `pnpm seed:vicosa` | Cenário completo: eventos da região de Viçosa (mais próximos) + grandes eventos nacionais. |
| `pnpm seed:brasil` | Foco nos grandes eventos nacionais (Rock in Rio, Lollapalooza, Carnaval, F1, CCXP, etc.). |
| `pnpm db:reset` | Reseta as coleções do banco (`scripts/reset-db.ts`). |
| `pnpm shadcn` | Atalho para o CLI do shadcn/ui (adicionar componentes de UI). |

> O `pnpm seed` apaga usuários, eventos, ingressos, lotes, pedidos, tickets,
> check-ins e equipe antes de recriar tudo. Use somente em base de desenvolvimento.

## Papéis (acesso por evento)
O acesso global é apenas **usuário** ou **admin**. Qualquer usuário pode criar
eventos (tornando-se o organizador deles) e, dentro de cada evento, adicionar
outros usuários como operadores (coleção `EventStaff`).
- **usuário**: compra ingressos, cria/gerencia os próprios eventos e faz check-in dos eventos onde é organizador ou operador (atalho no header).
- **operador (por evento)**: faz check-in e baixa a lista de compradores daquele evento; vê em "Meus eventos" os eventos onde atua como operador.
- **admin**: gerencia todos os eventos (editar, excluir, analytics, cortesias) e usuários. Faz check-in pelo gerenciador de eventos (não há atalho no header).

## Contas de teste (seed)
Senha para todas: `Password123!`
- `admin@ticketflow.com` — admin (painel administrativo)
- `organizer1@ticketflow.com` — organizador (perfil PJ; dono de vários eventos)
- `operator@ticketflow.com` — operador (faz check-in em alguns eventos)
- `buyer1@ticketflow.com` — comprador com pedidos e ingressos (testa `/orders` e `/tickets`)

## Variáveis de ambiente
Veja `.env.example` para a lista completa.

Obrigatórias:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `JWT_SECRET`
- `TICKET_HMAC_SECRET`

Opcionais:
- `RESEND_API_KEY` (envio de e-mails)
- `STRIPE_SECRET_KEY` (pagamento real — atualmente o checkout é simulado)

## Privacidade e LGPD
- Banner de consentimento de cookies (essenciais x não essenciais) em todas as páginas.
- Central de privacidade em `/privacidade`: dados coletados, cookies usados e requisições LGPD.
- Requisições do titular: exportar dados (JSON), corrigir perfil e excluir conta.

## Documentação do projeto
Plano de projeto completo (arquitetura, requisitos, escopo, cronograma e custos) em `TCC.md`.

## Status atual
- Home com eventos em destaque e capas
- Autenticação (registro, login, recuperação de senha com stub)
- Páginas públicas de eventos (listagem e detalhes) responsivas
- Gestão de eventos, ingressos, lotes e analytics por organizador
- Equipe por evento (operadores) e cortesias (ingressos gratuitos sem valor para o faturamento)
- Analytics da plataforma com intervalos (semana/mês/ano/total e período personalizado) e comparativos
- Compra com pagamento simulado e ingressos com QR dinâmico (com lote, titular e CPF com ocultar/mostrar)
- Taxa de serviço de 5% somada ao comprador no checkout (repasse de 100% ao organizador)
- Eventos em destaque (patrocinados) com prioridade na home e na listagem
- Check-in com scanner QR, modo offline (cache + fila) e sincronização
- Lista de compradores em CSV para conferência offline
- Consentimento de cookies + central de privacidade (LGPD)
- Health endpoint com verificação de DB
- Middleware com headers de segurança + proteção de rotas
