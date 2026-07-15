# Sistema Web Escalável para Venda de Ingressos Online

> **Plano de Projeto** apresentado ao Curso de Análise e Desenvolvimento de Sistemas do Centro Universitário de Viçosa, como parte dos requisitos para conclusão da disciplina **ADS504 - Arquitetura de Software e Projeto Integrador**.

| Campo | Valor |
|---|---|
| **Instituição** | Centro Universitário de Viçosa |
| **Curso** | Análise e Desenvolvimento de Sistemas |
| **Autores** | Edson Ramos da Silva Junior; Bernardo Cordeiro Motta |
| **Orientador** | Prof. Me. Dr. Carlos Henrique Tavares Brumatti |
| **Local / Ano** | Viçosa, 2025 |
| **Aprovação (versões)** | Mirella |

---

## Resumo

A indústria global de eventos enfrenta desafios significativos na comercialização digital de ingressos, incluindo problemas de **escalabilidade** durante picos de demanda, **vulnerabilidades de segurança** e **experiências de usuário** inadequadas. Este trabalho apresenta o projeto arquitetural de uma plataforma web robusta para venda de ingressos online, fundamentada em princípios de engenharia de software e centrada nas necessidades dos stakeholders.

A metodologia adotada incluiu análise detalhada dos stakeholders através de personas e mapa de empatia, seguida pela especificação completa de requisitos funcionais e não funcionais. A solução proposta contempla uma **arquitetura full-stack baseada em Next.js e MongoDB** com infraestrutura em nuvem escalável, sistema de autenticação seguro, gestão completa de eventos, fluxo de compra otimizado com integração a gateways de pagamento, geração de ingressos digitais com **QR Codes dinâmicos** e sistema de controle de acesso com **funcionamento offline**.

O projeto estabelece conformidade com padrões de segurança **PCI DSS**, proteção contra vulnerabilidades **OWASP Top 10**, aderência à **LGPD** e acessibilidade segundo **WCAG 2.1**. A análise de riscos e restrições garante viabilidade técnica e operacional da solução.

**Palavras-chave:** sistemas de ingressos; arquitetura full-stack; Next.js; MongoDB; segurança da informação; escalabilidade.

---

## Controle de Versão

| Versão | Data | Descrição da Atualização | Autor | Aprovado por |
|---|---|---|---|---|
| 1.0 | 27/08/2024 | Registro da empresa fictícia | Edson e Bernardo | Mirella |
| 1.1 | 12/09/2024 | Introdução, problema, justificativa, escopo e contraescopo | Edson e Bernardo | Mirella |
| 1.2 | 17/09/2024 | Mapa de empatia, Persona | Edson e Bernardo | Mirella |
| 1.3 | 24/09/2024 | Controle de versão, lista de siglas e abreviaturas, estrutura do projeto e termo de abertura | Edson e Bernardo | Mirella |
| 1.4 | 07/10/2024 | Engenharia de Requisitos completa, inclusão de citações e referências, atualizações em RF/RNF | Edson e Bernardo | Mirella |
| 2.0 | 17/10/2024 | Cap. 4 - Planejamento completo: EAP, lista de tarefas, RACI e sequenciamento | Edson e Bernardo | Mirella |
| 2.1 | 26/10/2024 | Cap. 5 - Material e Métodos: caracterização, recursos, procedimentos, avaliação e limitações | Edson e Bernardo | Mirella |
| 2.2 | 26/10/2024 | Cap. 6 - Condução do Projeto: governança, comunicação, riscos, mudanças e qualidade | Edson e Bernardo | Mirella |
| 2.3 | 04/11/2024 | Cap. 7 - Cronograma: diagrama de rede, caminho crítico e Gantt sumarizado | Edson e Bernardo | Mirella |
| 2.4 | 04/11/2024 | Cap. 8 - Recursos e Custos: estimativas detalhadas, orçamento e análise de viabilidade | Edson e Bernardo | Mirella |
| 3.0 | 16/11/2024 | Cap. 9 - Resultados Esperados: entregas técnicas, melhorias para stakeholders. Documento completo | Edson e Bernardo | Mirella |

---

## Lista de Abreviaturas e Siglas

| Sigla | Significado |
|---|---|
| API | Application Programming Interface |
| APM | Application Performance Monitoring |
| AWS | Amazon Web Services |
| CAPEX | Capital Expenditure |
| CDN | Content Delivery Network |
| CI/CD | Continuous Integration/Continuous Deployment |
| CPM | Critical Path Method |
| CRUD | Create, Read, Update, Delete |
| DAST | Dynamic Application Security Testing |
| EAP | Estrutura Analítica do Projeto |
| E2E | End-to-End |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| LGPD | Lei Geral de Proteção de Dados |
| MongoDB | Mongo Database |
| Next.js | React Framework for Full-Stack Web Applications |
| NPS | Net Promoter Score |
| OAuth | Open Authorization |
| OPEX | Operational Expenditure |
| OWASP | Open Web Application Security Project |
| PCI DSS | Payment Card Industry Data Security Standard |
| PIX | Sistema de Pagamentos Instantâneos |
| QA | Quality Assurance |
| QR Code | Quick Response Code |
| RACI | Responsible, Accountable, Consulted, Informed |
| REST | Representational State Transfer |
| RF | Requisito Funcional |
| RNF | Requisito Não Funcional |
| ROI | Return on Investment |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| S3 | Simple Storage Service |
| SAST | Static Application Security Testing |
| SLA | Service Level Agreement |
| SPI | Schedule Performance Index |
| SSL | Secure Sockets Layer |
| SUS | System Usability Scale |
| SV | Schedule Variance |
| TLS | Transport Layer Security |
| UX/UI | User Experience/User Interface |
| WAF | Web Application Firewall |
| WCAG | Web Content Accessibility Guidelines |
| WBS | Work Breakdown Structure |

---

# 1. Introdução

## 1.1 Contextualização

A indústria global de eventos (megafestivais, competições esportivas, conferências corporativas, espetáculos teatrais) representa um setor dinâmico e de grande impacto econômico. O sucesso desses eventos está intrinsecamente ligado à eficiência de seus sistemas de comercialização de ingressos. Houve uma massiva migração das bilheterias físicas para plataformas digitais, impulsionada por computação em nuvem (elasticidade e disponibilidade global). Essa mudança introduziu desafios complexos de tecnologia, segurança e experiência do usuário.

A robustez de uma plataforma de ingressos online é requisito fundamental: capacidade de gerenciar picos de alta demanda, garantir segurança de transações financeiras e combater fraudes.

### 1.1.1 Problema e Justificativa

O problema central é a **persistente lacuna no mercado** de plataformas que conciliem três pilares: **alta performance sob demanda, segurança ponta-a-ponta e experiência de usuário fluida**.

Deficiências sistêmicas atuais:
- **Consumidor:** sistemas inacessíveis em lançamentos, filas virtuais instáveis, processos de compra confusos, falhas no pagamento, vulnerabilidade a fraudes (cambistas com robôs, bilhetes falsificados).
- **Organizadores:** perdas de receita, danos à reputação, complexidade na gestão de acessos e validação, falta de ferramentas contra cambismo, necessidade de conformidade com LGPD.

**Justificativa da solução:**
- Arquitetura full-stack **Next.js** (renderização no servidor + rotas de API), escalável horizontalmente.
- **MongoDB** como banco documental, flexível para eventos/ingressos/pedidos e alto volume de leitura.
- **QR Codes dinâmicos** vinculados a contas, com validação em tempo real (anti-falsificação/cambismo).
- Conformidade **PCI DSS**, **OWASP Top 10**, **WCAG 2.1**.

### 1.1.2 Objetivos

**Objetivo Geral:** Projetar e desenvolver um sistema web completo e robusto para venda de ingressos online, priorizando segurança, escalabilidade e usabilidade, otimizando a gestão de eventos para organizadores e proporcionando compra transparente, rápida e confiável para consumidores.

**Objetivos Específicos:**
- Desenvolver módulo de identidade e acesso seguro (compradores e organizadores) com validação de dados.
- Implementar interface administrativa para organizadores cadastrarem/gerenciarem eventos (local, data, capacidade, lotes, categorias de preço).
- Construir fluxo de compra otimizado com carrinho resiliente e gateway de pagamento (Pix e cartão).
- Implementar geração de ingressos digitais seguros com QR Codes únicos, dinâmicos e intransferíveis.
- Criar portal do cliente (visualizar, gerenciar e acessar ingressos + histórico).
- Desenvolver solução de controle de acesso (check-in) de baixa latência via leitura de QR Code.

### 1.1.3 Escopo e Contraescopo

**Dentro do Escopo:**
- Plataforma web responsiva (desktop, tablet, smartphone).
- Cadastro detalhado de eventos (imagens, descrições, políticas, tipos de ingresso: Pista, VIP, Meia-entrada).
- Sistema de filas virtuais para alta demanda.
- Processo de compra completo com confirmação por e-mail.
- Integração com API de pagamento conforme PCI DSS.
- Geração de ingressos digitais com QR Code que se atualiza periodicamente.
- Aplicação simplificada de controle de acesso com validação em tempo real.

**Fora do Escopo (Contraescopo):**
- Aplicativos móveis nativos (Android/iOS) — interação móvel garantida pela web responsiva.
- Mercado secundário (revenda/transferência de ingressos).
- Escolha de assentos marcados em mapas (teatros/estádios).
- Módulos de marketing, afiliados, fidelidade/pontos/milhas.
- Painéis analíticos e relatórios financeiros complexos.
- Recursos de interação social (avaliações, comentários, listas de amigos).

---

# 2. Análise de Stakeholders e Termo de Abertura

## 2.1 Personas

### Persona 1 — João Silva (Organizador de Eventos)
- 35 anos, produtor de eventos culturais/musicais de médio porte; 5–10 eventos/ano, 500–5.000 pessoas.
- **Características:** 8 anos de experiência, foco em eficiência operacional e custos, preocupação com segurança/fraudes, valoriza relatórios detalhados.
- **Desafios:** falhas em picos de demanda, cambismo/falsificação, falta de relatórios em tempo real, gestão complexa de lotes.
- **Objetivos:** plataforma confiável sob alta demanda, controle de acesso/anti-fraude, relatórios em tempo real, interface administrativa intuitiva.

### Persona 2 — Maria Santos (Compradora de Ingressos)
- 28 anos, analista de marketing, frequentadora assídua de eventos; compra mensal via smartphone.
- **Características:** usuária experiente de e-commerce, valoriza rapidez/segurança/transparência, influencia amigos em redes sociais.
- **Desafios:** filas instáveis, processos confusos, insegurança sobre autenticidade/dados, dificuldade de acesso pós-compra.
- **Objetivos:** compra rápida e sem frustrações, segurança em transações, acesso fácil aos ingressos, transparência sobre taxas/políticas.

### Persona 3 — Carlos Mendes (Operador de Portaria)
- 42 anos, +10 anos em controle de acesso; trabalha sob pressão em horários de pico.
- **Características:** precisa de ferramentas simples e eficientes, atua em condições adversas (ruído, multidões), valoriza funcionamento offline.
- **Desafios:** identificação de falsificações, sistemas lentos, falta de info em tempo real, dependência de conectividade.
- **Objetivos:** validação instantânea via QR Code, interface simples mobile, funcionamento offline, informações claras do portador.

## 2.2 Mapa de Empatia (Síntese)

| Persona | Dores | Ganhos |
|---|---|---|
| João (Organizador) | Falhas em picos, falta de controle sobre cambismo, relatórios insuficientes | Plataforma confiável, controle eficaz, insights em tempo real |
| Maria (Compradora) | Filas instáveis, processos confusos, insegurança sobre fraudes, acesso posterior difícil | Compra rápida/segura, acesso fácil, transparência |
| Carlos (Portaria) | Sistemas lentos, dificuldade de identificar fraudes, dependência de conectividade | Validação instantânea, interface simples, offline confiável |

## 2.3 Requisitos de Alto Nível

**Funcionais:**
- **RF001 — Gestão de Eventos:** cadastro completo (info detalhada, ingressos, lotes, capacidade, políticas).
- **RF002 — Processo de Compra Otimizado:** carrinho, múltiplos pagamentos, confirmação por e-mail.
- **RF003 — Ingressos Digitais Seguros:** QR Code dinâmico e único, vinculado à conta.
- **RF004 — Controle de Acesso:** validação rápida na portaria, offline com sincronização posterior.

**Não-Funcionais:**
- **RNF001 — Escalabilidade:** até 10.000 usuários simultâneos sem degradação.
- **RNF002 — Segurança:** PCI DSS e criptografia de dados sensíveis.
- **RNF003 — Usabilidade:** responsiva, mobile, carregamento < 2s.

## 2.4 Termo de Abertura do Projeto

### Stakeholders Identificados
- **Primários:** organizadores (pequeno/médio/grande porte), consumidores finais, operadores de portaria.
- **Secundários:** equipe de dev/manutenção, provedores de gateway de pagamento, fornecedores de nuvem, órgãos reguladores de proteção de dados.

### Cronograma Macro
| Fase | Duração |
|---|---|
| 1 - Análise e Planejamento | 4 semanas |
| 2 - Desenvolvimento do Core | 12 semanas |
| 3 - Desenvolvimento Complementar | 8 semanas |
| 4 - Testes e Validação | 4 semanas |
| 5 - Implantação e Go-live | 2 semanas |
| **Total** | **30 semanas (~7,5 meses)** |

### Recursos Necessários
- **Humanos:** 1 Gerente de Projeto, 2 Desenvolvedores Full-Stack Sênior, 1 Especialista em Segurança e Pagamentos, 1 Designer UX/UI, 1 Analista de Testes e QA.
- **Tecnológicos:** nuvem escalável (AWS/Azure/GCP), CDN, gateway PCI DSS, ferramentas CI/CD, monitoramento/observabilidade.
- **Financeiros:** Orçamento total **R$ 118.000,00** — RH ~82% (R$ 97.300), Infra/Tecnologia ~15% (R$ 17.500), Contingência ~3% (R$ 3.200).

### Riscos Iniciais
- **Técnicos:** picos excedendo infraestrutura, complexidade de integração com gateways, vulnerabilidades em transações.
- **Negócio:** mudanças regulatórias (PIX/cartões), concorrência estabelecida, resistência de organizadores.
- **Projeto:** atrasos por complexidade, indisponibilidade de recursos especializados, mudanças de escopo.

### Critérios de Sucesso
- **Técnicos:** resposta < 2s para 95% das requisições; disponibilidade > 99,9%; 10.000 transações simultâneas; erro < 0,1%.
- **Segurança:** fraude < 0,1%; certificação PCI DSS Level 1; zero vazamentos.
- **UX:** abandono de compra < 15%; satisfação > 4,5/5,0; finalização < 3 min; validação > 99,5%.
- **Negócio:** 100.000 ingressos no 1º ano; 50 organizadores em 6 meses; ROI positivo a partir do 18º mês; crescimento de 25%/trimestre.

---

# 3. Engenharia de Requisitos

## 3.1 Requisitos Funcionais

- **RF001 — Autenticação e Autorização:** cadastro com validação de e-mail; perfis Organizador/Comprador/Operador; autenticação JWT e OAuth 2.0.
- **RF002 — Gestão de Eventos:** cadastro completo; múltiplos tipos de ingressos e lotes; upload de imagens; capacidade e políticas.
- **RF003 — Processo de Compra:** carrinho com quantidade/tipos; gateway (PIX e cartão); filas virtuais; confirmação por e-mail.
- **RF004 — Ingressos Digitais Seguros:** QR Code único e dinâmico; vinculação à conta; prevenção de screenshots; atualização periódica.
- **RF005 — Controle de Acesso:** validação via QR Code; offline com sincronização; registro de entrada e capacidade em tempo real; interface mobile.
- **RF006 — Portal do Cliente:** visualização de ingressos; histórico de compras; reenvio por e-mail; gestão de dados pessoais.

## 3.2 Requisitos Não Funcionais

- **RNF001 — Performance/Escalabilidade:** resposta < 2s (95%); 10.000 simultâneos; disponibilidade > 99,9%; auto-scaling.
- **RNF002 — Segurança:** PCI DSS; criptografia em trânsito e repouso; proteção OWASP Top 10; auditoria de transações.
- **RNF003 — Usabilidade:** responsiva; máximo 3 cliques para finalizar; suporte aos principais navegadores; WCAG 2.1.
- **RNF004 — Confiabilidade:** backup automático; recuperação de desastres < 4h; monitoramento 24/7; logs detalhados.

## 3.3 Histórias de Usuário

- **US001 — Comprar Ingresso:** Como comprador, quero selecionar e finalizar a compra rapidamente. *Aceitação:* < 3 min, confirmação por e-mail, ingresso imediato.
- **US002 — Validar Entrada:** Como operador, quero escanear QR Codes rapidamente. *Aceitação:* < 2s, offline, informações claras.
- **US003 — Gerenciar Evento:** Como organizador, quero acompanhar vendas em tempo real. *Aceitação:* dashboard a cada 5 min, relatórios exportáveis, alertas de capacidade.

## 3.4 Riscos do Projeto

| ID | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R001 | Picos de demanda extrema | Alta | Crítico | Filas virtuais, CDN global, auto-scaling agressivo |
| R002 | Falhas na integração de pagamentos | Média | Alto | Múltiplos provedores, fallback automático, testes de carga |
| R003 | Fraudes e falsificação | Média | Alto | QR Codes dinâmicos, ML para detecção de padrões |
| R004 | Conectividade no local do evento | Média | Médio | Modo offline robusto, sincronização inteligente, backup de conectividade |

## 3.5 Restrições

- **Tecnológicas:** PCI DSS Level 1; OWASP Top 10; WCAG 2.1 AA; sem apps nativos (apenas web responsiva); nuvem com auto-scaling.
- **Legais/Regulatórias:** LGPD; Código de Defesa do Consumidor; regulamentações de eventos; normas do Banco Central.
- **Orçamentárias:** limite de R$ 118.000,00; distribuição fixa; sem recursos adicionais; aprovação para mudanças de escopo.
- **Temporais:** 30 semanas; datas de fase não negociáveis; marcos conforme calendário acadêmico.
- **Operacionais:** check-in offline; conectividade limitada; operável em condições adversas; disponibilidade ≥ 99,9%.

---

# 4. Planejamento do Projeto

## 4.1 Estrutura Analítica do Projeto (EAP)

```
1.0 PLATAFORMA DE INGRESSOS ONLINE
├── 1.1 INICIAÇÃO E PLANEJAMENTO
│   ├── 1.1.1 Análise de Requisitos
│   ├── 1.1.2 Definição de Arquitetura
│   └── 1.1.3 Planejamento Detalhado
├── 1.2 INFRAESTRUTURA E SEGURANÇA
│   ├── 1.2.1 Configuração de Ambiente Cloud
│   ├── 1.2.2 Implementação de CDN
│   └── 1.2.3 Configuração de Segurança
├── 1.3 BACKEND E APIS
│   ├── 1.3.1 API de Autenticação
│   ├── 1.3.2 API de Gestão de Eventos
│   ├── 1.3.3 API de Processamento de Pagamentos
│   └── 1.3.4 API de Ingressos Digitais
├── 1.4 FRONTEND
│   ├── 1.4.1 Interface do Comprador
│   ├── 1.4.2 Dashboard do Organizador
│   └── 1.4.3 Aplicação de Check-in
├── 1.5 INTEGRAÇÕES
│   ├── 1.5.1 Gateway de Pagamento
│   ├── 1.5.2 Serviço de E-mail
│   └── 1.5.3 Sistema de Filas
├── 1.6 TESTES E QUALIDADE
│   ├── 1.6.1 Testes Unitários
│   ├── 1.6.2 Testes de Integração
│   ├── 1.6.3 Testes de Carga
│   └── 1.6.4 Testes de Segurança
└── 1.7 IMPLANTAÇÃO E ENCERRAMENTO
    ├── 1.7.1 Deploy em Produção
    ├── 1.7.2 Monitoramento e Observabilidade
    └── 1.7.3 Documentação e Treinamento
```

### Dicionário da EAP (resumo de entregas)
- **1.1 Iniciação:** Documento de Requisitos, Documento de Arquitetura (Next.js + MongoDB), Plano de Gerenciamento.
- **1.2 Infraestrutura/Segurança:** ambientes dev/homolog/prod, CDN, WAF, TLS/SSL, IAM, backup, conformidade LGPD.
- **1.3 Backend/APIs:** autenticação (JWT/OAuth), CRUD de eventos, pagamentos (carrinho, gateway, estoque, comprovantes), ingressos (QR dinâmico, validação).
- **1.4 Frontend:** interface do comprador, dashboard do organizador, app de check-in (offline + sync).
- **1.5 Integrações:** gateway (Stripe/Mercado Pago) + webhooks, e-mail transacional (SendGrid/SES), filas (Redis/RabbitMQ).
- **1.6 Testes:** unitários (cobertura ≥ 80%), integração, carga (10.000 simultâneos), segurança (SAST/DAST, pentest).
- **1.7 Implantação:** blue-green deployment, APM/observabilidade, documentação e treinamento.

## 4.2 Matriz de Responsabilidades (RACI)

> **R**=Responsible, **A**=Accountable, **C**=Consulted, **I**=Informed
> **GP**=Gerente de Projeto, **Dev**=Desenvolvedores (2), **Seg**=Especialista Segurança/Pagamentos, **UX**=Designer UX/UI, **QA**=Analista de Testes

| Atividade | GP | Dev | Seg | UX | QA |
|---|---|---|---|---|---|
| Análise de Requisitos | A | C | C | R | I |
| Definição de Arquitetura | C | R/A | C | I | I |
| Planejamento Detalhado | R/A | C | C | C | C |
| Configuração Cloud | I | R | C | I | I |
| Implementação CDN | I | R | I | I | I |
| Configuração Segurança | C | C | R/A | I | C |
| API Autenticação | I | R | C | I | C |
| API Eventos | I | R | I | I | C |
| API Pagamentos | C | R | R | I | C |
| API Ingressos | I | R | C | I | C |
| Interface do Comprador | C | C | I | R/A | C |
| Dashboard Organizador | C | C | I | R/A | C |
| Aplicação Check-in | C | C | I | R/A | C |
| Integração Gateway Pagamento | C | R | R | I | C |
| Integração Serviço E-mail | I | R | I | I | I |
| Implementação Filas | C | R | C | I | C |
| Testes Unitários | I | R | I | I | C |
| Testes Integração | C | C | I | I | R/A |
| Testes Carga | C | C | I | I | R/A |
| Testes Segurança | C | C | R | I | R/A |
| Deploy Produção | A | R | C | I | C |
| Configuração Monitoramento | C | R | C | I | C |
| Documentação Técnica | C | R/A | C | I | C |
| Treinamento Usuários | R | C | I | C | I |

## 4.3 Sequenciamento de Tarefas (dependências principais)

Tipos de dependência: **TI** (Término-Início, mais comum), **II** (Início-Início, com possível lag).

| ID | Tarefa | Duração | Predecessora |
|---|---|---|---|
| 1.1.1 | Workshops stakeholders | 1 sem | - |
| 1.1.2 | Documentar RF | 1 sem | 1.1.1 |
| 1.1.3 | Documentar RNF | 1 sem | 1.1.1 |
| 1.1.4 | Validar requisitos | 3 dias | 1.1.2, 1.1.3 |
| 1.2.1 | Projetar arquitetura | 1 sem | 1.1.4 |
| 1.2.2 | Selecionar stack | 3 dias | 1.2.1 |
| 1.2.3 | Elaborar diagramas | 1 sem | 1.2.2 |
| 1.2.4 | Revisar arquitetura | 2 dias | 1.2.3 |
| 1.3.1 | Provisionar cloud | 1 sem | 1.2.4 |
| 1.3.5 | Configurar segurança | 1 sem | 1.3.1 |
| 2.2.2 | CRUD eventos | 2 sem | 2.2.1 |
| 2.3.3 | Integrar gateway pagamento | 2 sem | 2.3.1, 2.2.5 |

---

# 5. Material e Métodos

## 5.1 Caracterização do Projeto
- Desenvolvimento tecnológico aplicado; sistema de informação transacional (e-commerce, pagamentos, identidade, controle de acesso físico).
- Tipo **greenfield** (sem sistemas legados), arquitetura full-stack Next.js + MongoDB.
- Complexidade **média a alta** (integrações externas, PCI DSS/LGPD, alta disponibilidade/escalabilidade).
- Abordagem **incremental e iterativa** (Scrum adaptado), **sprints de 2 semanas**.

## 5.2 Local do Projeto
- Ambiente acadêmico (Centro Universitário de Viçosa).
- Infraestrutura inteiramente em nuvem (AWS/Azure/GCP), ambientes **Dev / Homologação / Produção**.
- Validação do check-in em eventos reais de pequeno/médio porte na região de Viçosa.

## 5.3 Recursos

**Humanos (6 profissionais):** Gerente de Projeto (PMP); 2 Desenvolvedores Full-Stack Sênior (JS/TS, Next.js, MongoDB); Especialista em Segurança e Pagamentos (OWASP, criptografia, tokenização); Designer UX/UI (Figma, WCAG 2.1); Analista de Testes/QA (Jest, Cypress, JMeter, CI/CD).

**Tecnológicos:**
- *Infra de Nuvem:* execução Next.js (Vercel/AWS/Azure/GCP), MongoDB Atlas, Redis (cache/filas), storage de objetos (S3/Blob/Cloud Storage), CDN, Load Balancer + Auto-scaling.
- *Desenvolvimento:* Next.js (React), VS Code/WebStorm/IntelliJ, Git (GitHub/GitLab), Docker, deploy gerenciado (Vercel).
- *Qualidade/Monitoramento:* GitHub Actions/GitLab CI/Jenkins, Jest/Pytest/Cypress/Selenium, SonarQube, New Relic/DataDog/Prometheus+Grafana, ELK/CloudWatch.
- *Integrações:* Gateway (Stripe/Mercado Pago/PagSeguro), e-mail (SendGrid/SES/Mailgun), SMS opcional (Twilio/SNS), geolocalização (Google Maps/Mapbox).

**Conhecimento:** ISO 9241-11, WCAG 2.1, PCI DSS, LGPD, CDC, OWASP, literatura de arquitetura full-stack e engenharia de requisitos.

## 5.4 Procedimentos

**Metodologia Ágil (Scrum adaptado):** sprints de 2 semanas; cerimônias (Planning 4h, Daily 15min, Review 2h, Retrospective 1,5h); artefatos (Product Backlog, Sprint Backlog, Incremento).

**Arquitetura Full-Stack (Next.js + MongoDB):** apresentação + backend no mesmo código-fonte, stateless (escalabilidade horizontal), MongoDB com coleções/índices.

Módulos de domínio:
1. **Identidade e Acesso** — autenticação, autorização, gestão de usuários
2. **Eventos** — cadastro, categorias, lotes, info públicas
3. **Ingressos** — tipos, disponibilidade, geração de QR Codes
4. **Pedidos e Carrinho** — reserva, itens, fluxo de compra
5. **Pagamentos** — integração com gateway e confirmações
6. **Notificações** — e-mail e comunicações transacionais
7. **Check-in** — validação de ingressos e controle de acesso

**Controle de Qualidade:** testes unitários (cobertura ≥ 80%), integração, E2E, carga/performance, segurança (SAST/DAST/pentest), usabilidade (5–8 participantes/perfil).

**CI/CD:** testes a cada push, análise estática, build (Next.js + Docker), deploy automático em dev, aprovação manual para homolog/prod, blue-green deployment.

**Gestão de Configuração (GitFlow):** `main` (produção), `develop` (integração), `feature/*`, `hotfix/*`. Documentação: OpenAPI/Swagger, C4 Model, manuais, runbooks.

## 5.5 Avaliação do Projeto (Métricas-chave)

| Dimensão | Métrica | Meta |
|---|---|---|
| Performance | Resposta APIs (P95) | < 200ms |
| Performance | Carregamento de páginas | < 2s |
| Performance | Disponibilidade | > 99,9% |
| Performance | Taxa de erro | < 0,1% |
| Escalabilidade | Usuários simultâneos | 10.000 |
| Qualidade | Cobertura de testes | > 80% |
| Qualidade | Manutenibilidade SonarQube | A ou B |
| Qualidade | Densidade de defeitos | < 0,5/1000 linhas |
| Segurança | Vulnerabilidades críticas | 0 |
| Segurança | Conformidade OWASP Top 10 | 100% |
| UX | Conclusão de compra | > 95% |
| UX | Tempo médio de compra | < 3 min |
| UX | Abandono de carrinho | < 15% |
| UX | SUS | > 80 |
| UX | NPS | > 50 |
| UX | Acessibilidade WCAG 2.1 AA | 100% |
| Negócio | Organizadores (6 meses) | 50 |
| Negócio | Ingressos (1º ano) | 100.000 |
| Negócio | ROI positivo | a partir do 18º mês |

**Coleta de dados:** APM (New Relic/DataDog), Analytics (Google Analytics/Mixpanel), logs (ELK), pesquisas pós-compra, testes de usabilidade, A/B testing.

## 5.6 Limitações do Estudo
- **Escopo:** sem apps nativos, sem mercado secundário, sem escolha de assentos marcados.
- **Temporais:** 30 semanas; sem dados históricos reais (greenfield, uso de dados sintéticos).
- **Recursos:** equipe de 6 pessoas; orçamento fixo de R$ 118.000.
- **Metodológicas:** usabilidade com 5–8 usuários/perfil; testes de check-in em eventos pequenos/médios; 1–2 gateways.
- **Contextuais:** foco no mercado brasileiro (LGPD, PIX); cenário tecnológico em evolução.

---

# 6. Condução do Projeto

## 6.1 Governança
- Estrutura **matricial balanceada**: GP com autoridade sobre planejamento/controle; especialistas com autonomia técnica.
- **Comitê de Direcionamento:** orientador acadêmico + GP + stakeholders; reuniões quinzenais.
- **Decisões:** Estratégicas (Comitê) / Táticas (GP + especialistas) / Operacionais (equipe).

## 6.2 Comunicação
- **Reuniões:** Daily (15min), Planning (2 sem/4h), Review (2 sem/2h), Retrospective (2 sem/1,5h), Comitê (quinzenal/1h).
- **Ferramentas:** Slack/Teams, Jira/Azure DevOps, Confluence/Notion, GitHub/GitLab.
- **Relatórios:** relatório semanal de progresso; dashboard (burndown, velocity, testes, cobertura, dívida técnica); atas.

## 6.3 Gestão de Riscos — Estratégias de Resposta
- **R001 (Picos):** filas Redis, auto-scaling a 60% CPU, CDN, testes de carga a cada 3 sprints.
- **R002 (Pagamentos):** 2 gateways independentes, circuit breaker/fallback, sandbox, alertas para erro > 1%.
- **R003 (Fraudes):** QR Codes que atualizam a cada 30s, vinculação ingresso-usuário, logs forenses, detecção de padrões.
- **R004 (Conectividade):** modo offline com cache local, sincronização inteligente, backup 4G/5G, evento piloto.

## 6.4 Gestão de Mudanças
- Processo: Solicitação → Análise de Impacto → Classificação → Decisão → Implementação → Comunicação.
- **Classificação:** Menor (sem impacto, GP) / Moderada (< 5%, Comitê) / Maior (≥ 5%, orientador acadêmico).
- **Baselines:** Requisitos (Sem. 4), Arquitetura (Sem. 6), Escopo (Sem. 8). Versionamento semântico (MAJOR.MINOR.PATCH).

## 6.5 Gestão da Qualidade
- **QA:** peer review (≥ 1 dev sênior), linters, Definition of Done (código revisado, testes ≥ 80%, integração, docs, zero vulnerabilidades críticas/altas, aprovação do PO).
- **Auditorias** a cada 4 sprints; Quality Gates no SonarQube; testes de carga progressivos (1k/5k/10k).

## 6.6–6.9 Outras Gestões
- **RH:** matriz de habilidades, alocação dinâmica, pair programming, tech talks quinzenais, retrospectivas trimestrais.
- **Aquisições:** seleção de nuvem (TCO, LGPD, SLA) e gateway (conversão, taxas, PCI DSS Level 1); contratos com SLAs e penalidades.
- **Integração:** sprints sincronizados, CI/CD contínuo, matriz de dependências, resolução expedita de bloqueios.
- **Encerramento:** Sprint Review/Retrospective/métricas; encerramento de fase com revisão de entregáveis, lições aprendidas e aprovação formal.

---

# 7. Cronograma e Caminho Crítico

## 7.1 Método do Caminho Crítico (CPM)
Duração total do caminho crítico: **30 semanas**. Etapas: Forward Pass, Backward Pass, cálculo de folga total, identificação de atividades com folga zero.

### Caminho Crítico (resumo)
Workshops → Documentar RF → Validar requisitos → Projetar arquitetura → Selecionar stack → Diagramas → Revisar arquitetura → Provisionar cloud → Configurar segurança → Validar infra → Modelo/CRUD eventos → Gestão de lotes → Testar API eventos → Lógica carrinho → Integrar gateway → Webhooks → Comprovante → Testar pagamentos → Fluxo de compra frontend → Portal do cliente → Responsividade → Validar usabilidade → Testes E2E/integração → Testes de carga/otimização → Testes de segurança/pentest/remediação/certificação → Deploy blue-green → Go-live → Documentação/Treinamento → Finalizar.

### Análise de Folgas
| Pacote | Folga total |
|---|---|
| Autenticação e perfil (2.1.*) | 2 semanas |
| Ingressos digitais (2.4.*) | 3 semanas |
| Dashboard organizador (3.2.*) | 2 semanas |
| Aplicação Check-in (3.3.*) | 4 semanas |

### Marcos / Gates de Qualidade
| Marco | Descrição | Critérios |
|---|---|---|
| M1 | Requisitos aprovados (Sem. 3) | Documento assinado, baseline estabelecida |
| M2 | Arquitetura aprovada (Sem. 5) | Diagramas C4, decisões documentadas, revisão técnica |
| M3 | Infraestrutura operacional (Sem. 7) | Ambientes provisionados, conectividade 100% |
| M4 | APIs core funcionais (Sem. 14) | Auth/eventos/pagamentos testadas, cobertura > 80% |
| M5 | Frontend completo (Sem. 19) | Interfaces funcionais, usabilidade aprovada |
| M6 | Testes de qualidade aprovados (Sem. 25) | Cobertura > 80%, performance validada, zero vulnerab. críticas |
| M7 | Sistema em produção (Sem. 29) | Deploy, smoke tests, monitoramento ativo |
| M8 | Projeto finalizado (Sem. 30) | Documentação completa, treinamentos, retrospectiva |

## 7.2 Cronograma Sumarizado por Fases

| Fase | Duração | Período | Principais Entregas |
|---|---|---|---|
| 1. Iniciação e Planejamento | 4 sem | Sem. 1-4 | Requisitos validados, arquitetura, planejamento |
| 2. Infraestrutura e Segurança | 3 sem | Sem. 5-7 | Cloud operacional, CDN, segurança |
| 3. Desenvolvimento Backend | 8 sem | Sem. 7-14 | APIs auth, eventos, pagamentos, ingressos |
| 4. Desenvolvimento Frontend | 5 sem | Sem. 15-19 | Interfaces comprador, organizador, check-in |
| 5. Integrações | 4 sem | Sem. 16-19 | Gateways, e-mail, filas |
| 6. Testes e Qualidade | 7 sem | Sem. 19-25 | Suites de testes, performance, segurança |
| 7. Implantação e Encerramento | 2 sem | Sem. 29-30 | Produção, documentação, treinamento |

### Distribuição de Esforço (pessoa-semana)
| Fase | Esforço | Carga Média |
|---|---|---|
| 1. Iniciação | 20 p-sem | 5 pessoas |
| 2. Infraestrutura | 12 p-sem | 4 pessoas |
| 3. Backend | 40 p-sem | 5 pessoas (pico) |
| 4. Frontend | 25 p-sem | 5 pessoas (pico) |
| 5. Integrações | 16 p-sem | 4 pessoas |
| 6. Testes | 28 p-sem | 4 pessoas |
| 7. Implantação | 10 p-sem | 5 pessoas |
| **Total** | **151 p-sem** | **Média: 5 pessoas** |

**Gestão de buffer:** 10–15% em atividades críticas (gateway, testes de carga, segurança). Estratégias de aceleração: Fast-Tracking e Crashing (com aprovação do Comitê). Monitoramento via SV, SPI, burndown; desvios > 5% acionam ação corretiva.

---

# 8. Estimativa de Recursos e Custos

## 8.1 Metodologia
Estimativa **bottom-up**. Premissas: 30 semanas; R$; equipe no Brasil; regime bolsa/part-time (20h/semana, 50% dedicação); infra cloud pay-as-you-go com reserva para picos de 3x.

## 8.2 Recursos Humanos

| Função | Qtd | Salário Mensal | Duração | Custo Total |
|---|---|---|---|---|
| Gerente de Projeto | 1 | R$ 2.900 | 7,5 meses | R$ 21.750 |
| Desenvolvedor Full-Stack Sênior | 2 | R$ 3.300 | 7,5 meses | R$ 49.500 |
| Especialista Segurança/Pagamentos | 1 | R$ 2.000 | 3 meses | R$ 6.000 |
| Designer UX/UI | 1 | R$ 2.000 | 3 meses | R$ 6.000 |
| Analista de Testes e QA | 1 | R$ 1.300 | 4 meses | R$ 5.200 |
| **Subtotal RH** | | | | **R$ 88.450** |
| Contingência RH (10%) | | | | R$ 8.845 |
| **Total RH** | | | | **R$ 97.295** |

## 8.3 Infraestrutura e Tecnologia

**Nuvem (7,5 meses):** Servidores (R$ 1.800), MongoDB Atlas M0/M2 (R$ 2.100), Redis (R$ 600), Storage S3 (R$ 500), CDN (R$ 700), Load Balancer (R$ 400), Backup/DR (R$ 400). **Total: R$ 6.500**.

**Software/Ferramentas:** majoritariamente free tiers (GitHub, board, Figma, JMeter); Vercel+logs (R$ 400), e-mail (R$ 100). **Total: R$ 500**.

**Integrações/Serviços:** Gateway setup (R$ 1.000), revisão de segurança (R$ 1.000), pentest (R$ 800), Maps API (R$ 200), domínio/SSL (R$ 1.000). **Total: R$ 4.000**.

**Hardware:** equipamentos majoritariamente existentes; tablets para testes (R$ 800), dispositivo check-in (R$ 700). **Total: R$ 1.500**.

## 8.4 Outros Custos
- **Treinamentos:** Next.js (R$ 800), MongoDB (R$ 500), Scrum/Kanban (R$ 300), OWASP (R$ 400). **Total: R$ 2.000**.
- **Viagens/Eventos:** validação com organizadores (R$ 700), evento piloto (R$ 400), reunião gateway (R$ 400). **Total: R$ 1.500**.
- **Comunicação/Marketing:** pitch deck (R$ 400), vídeo (R$ 500), landing page (R$ 300), branding (R$ 300). **Total: R$ 1.500**.

## 8.5 Orçamento Consolidado

| Categoria | Custo | % | Status |
|---|---|---|---|
| Recursos Humanos | R$ 97.295 | 82,5% | Recorrente |
| Infraestrutura Cloud | R$ 6.500 | 5,5% | Recorrente |
| Software e Ferramentas | R$ 500 | 0,4% | Recorrente |
| Integrações e Serviços | R$ 4.000 | 3,4% | Único |
| Hardware e Equipamentos | R$ 1.500 | 1,3% | CAPEX |
| Treinamentos | R$ 2.000 | 1,7% | Único |
| Viagens e Eventos | R$ 1.500 | 1,3% | Único |
| Comunicação/Marketing | R$ 1.500 | 1,3% | Único |
| **Subtotal** | **R$ 114.795** | 97,5% | |
| Contingência (8%) | R$ 2.660 | 2,3% | |
| Margem Gestão/Imprevistos | R$ 545 | 0,2% | |
| **ORÇAMENTO TOTAL** | **R$ 118.000** | 100% | |

## 8.6 Análise de Viabilidade Financeira

**Modelo de Receita:** taxa de serviço 5% sobre ingresso; ticket médio R$ 80,00; receita por ingresso R$ 4,00.

**Break-Even:** investimento R$ 118.000; ~29.500 ingressos para ROI; com 20.000 ingressos/ano → break-even em 1,5 anos.

**OPEX pós-lançamento:** cloud R$ 1.200/mês + suporte R$ 4.000/mês + marketing R$ 2.000/mês = **R$ 7.200/mês (R$ 86.400/ano)**.

**Análise de Sensibilidade:**
- Otimista: 40.000 ingressos/ano → ROI em **9 meses**
- Realista: 20.000 ingressos/ano → ROI em **18 meses**
- Conservador: 12.000 ingressos/ano → ROI em **30 meses**

**Riscos orçamentários:** extensão de cronograma (R$ 8–10k/mês de RH), recursos adicionais (R$ 2–3k), infra subestimada (+20–30%), complexidade PCI DSS. **Economia possível:** até R$ 5.300 (4,5%) em hardware/software/marketing/treinamentos — **não reduzir** RH, testes de segurança ou infra mínima.

---

# 9. Resultados Esperados

## 9.1 Entregas Técnicas

**1. Autenticação e Gestão de Identidades:** JWT + OAuth 2.0; auth < 500ms; sucesso > 99,9%; zero vulnerabilidades críticas; conformidade OWASP.

**2. Gestão de Eventos:** CRUD com validação; categorias ilimitadas; lotes com controle automático; dashboard em tempo real; 100 eventos ativos simultâneos.

**3. Comercialização e Pagamentos:** finalização < 3 min; abandono < 15%; PIX e cartão em tempo real; sucesso > 99%; 10.000 transações simultâneas.

**4. Ingressos Digitais Seguros:** QR Code instantâneo pós-pagamento; atualização a cada 30s; vinculação criptografada; PDF para download; fraude < 0,1%.

**5. Controle de Acesso (Check-in):** validação < 2s; offline com cache de até 50.000 ingressos; sincronização inteligente; sucesso > 99,5%; interface mobile.

### Arquitetura e Infraestrutura
- **Full-Stack:** Next.js (SSR + rotas de API), módulos de domínio, MongoDB com índices, Docker quando necessário.
- **Cloud:** ambientes segregados, auto-scaling horizontal, load balancing, CDN global, backup com RPO/RTO de 4h.
- **Segurança:** PCI DSS Level 1, LGPD, TLS 1.3, AES-256, OWASP Top 10, WAF.

### Qualidade de Software
- Cobertura > 80%; suites de integração/E2E; manutenibilidade A (SonarQube); densidade de defeitos < 0,5/1000 linhas; dívida técnica < 5%; APIs 100% documentadas.
- Resposta média APIs < 200ms (P95 < 500ms); páginas < 2s; disponibilidade > 99,9%; erro < 0,1%; escala 10x.

## 9.2 Melhorias para Stakeholders

**Organizadores:** −70% tempo de gestão manual; dashboard centralizado; relatórios automatizados; −50% custos vs. bilheteria física; −90% falsificação; controle de cambismo; venda global 24/7; +30% alcance.

**Compradores:** compra em ≤ 3 etapas; interface responsiva; confirmação/envio automático; acesso permanente via portal; autenticidade garantida; LGPD + PCI DSS; PIX/cartão; histórico unificado; reenvio instantâneo; −95% risco de falsificação.

**Operadores de Portaria:** −80% tempo de validação; sem filas (< 2s); treinamento < 15 min; funcionamento offline; −60% necessidade de equipe; detecção de duplicados/fraudes; registro auditável; sincronização entre pontos.

## 9.3 Impactos Projetados
- **Setor de Eventos:** democratização do acesso à tecnologia; +40% eventos com comercialização digital profissional; redução de cambismo/falsificação; geração de dados estruturados.
- **Acadêmico/Científico:** consolidação de arquitetura full-stack/cloud, metodologias ágeis, segurança; estudo de caso e formação profissional.
- **Social:** acessibilidade WCAG 2.1 AA; participação para pessoas com limitação de mobilidade; transparência (CDC); inclusão digital.

## 9.4 Indicadores de Sucesso

**Técnicos:** disponibilidade > 99,9%; resposta P95 < 500ms; páginas < 2s; cobertura > 80%; vulnerabilidades críticas 0; erro < 0,1%; 10.000 usuários.

**UX:** conclusão > 95%; tempo < 3 min; abandono < 15%; SUS > 80; NPS > 50; satisfação > 4,5/5; WCAG 2.1 AA 100%.

**Negócio:** 50 organizadores (6 meses); 100 eventos e 100.000 ingressos (12 meses); pagamentos > 99%; validações > 99,5%; crescimento 25%/trimestre; fraude < 0,1%.

## 9.5 Sustentabilidade e Evolução Futura
- **Documentação:** técnica, manuais por perfil, runbooks, base de conhecimento.
- **Código:** modular, padrões consistentes, baixa dívida técnica, alta cobertura.
- **Roadmap:**
  - **Fase 2 (3–6 meses):** marketplace secundário, escolha de assentos, fidelidade.
  - **Fase 3 (6–12 meses):** apps nativos iOS/Android, analytics com ML, integração com redes sociais.
  - **Fase 4 (12+ meses):** expansão internacional, multi-idioma/multi-moeda, white-label.

---

## Referências

- **BRASIL.** Lei Geral de Proteção de Dados Pessoais — Lei nº 13.709/2018. Brasília, 2018.
- **GETZ, D.** Event Studies: Theory, Research and Policy for Planned Events. 2. ed. London: Routledge, 2012.
- **ISO.** ISO 9241-11:2018 — Ergonomics of human-system interaction — Part 11: Usability. Geneva, 2018.
- **KERZNER, H.** Project Management: A Systems Approach to Planning, Scheduling, and Controlling. 13. ed. Wiley, 2022.
- **MELL, P.; GRANCE, T.** The NIST Definition of Cloud Computing. NIST SP 800-145, 2011.
- **OWASP.** OWASP Top 10 — 2021. Disponível em: https://owasp.org/Top10/
- **PCI SECURITY STANDARDS COUNCIL.** Payment Card Industry Data Security Standard. 2022.
- **PRESSMAN, R. S.; MAXIM, B. R.** Engenharia de Software: Uma Abordagem Profissional. 9. ed. McGraw-Hill, 2021.
- **PROJECT MANAGEMENT INSTITUTE.** PMBOK Guide. 7. ed. PMI, 2021.
- **SCHWABER, K.; SUTHERLAND, J.** The Scrum Guide. Scrum.org, 2020. https://scrumguides.org/
- **SOMMERVILLE, I.** Engenharia de Software. 10. ed. Pearson, 2016.
- **VERZUH, E.** The Fast Forward MBA in Project Management. 5. ed. Wiley, 2021.
- **W3C.** Web Content Accessibility Guidelines (WCAG) 2.1. 2018.
