# syntax=docker/dockerfile:1
# Imagem de produção do TicketFlow (Next.js standalone), pronta para o Easypanel.
# Build multi-stage: deps -> build -> runner (imagem final mínima).

FROM node:20.9.0-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Dependências ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholders só para o build passar na validação do lib/env.ts. Os valores
# reais são injetados em runtime pelo Easypanel (variáveis de ambiente do serviço).
ENV MONGODB_URI="mongodb://localhost:27017/build"
ENV NEXTAUTH_SECRET="build-time-placeholder-secret-please-override-32x"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV JWT_SECRET="build-time-placeholder-secret-please-override-32x"
ENV TICKET_HMAC_SECRET="build-time-placeholder-hmac-secret"
RUN pnpm build

# --- Runner ---
FROM node:20.9.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Fuso horário do Brasil para que datas/horas (ex.: abertura de lotes, data do
# evento) sejam exibidas em horário de Brasília em vez de UTC.
RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
