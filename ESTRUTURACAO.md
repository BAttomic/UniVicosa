# Estruturação e Documentação do Repositório — Notas de Trabalho

> Documento de trabalho criado para registrar a análise do repositório, o plano de
> reestruturação e o histórico do que já foi feito. Serve como "memória" caso a sessão
> de trabalho seja reiniciada. Última atualização: **2026-07-02**.

Objetivo do dono do repositório: está **se formando em ADS (UniViçosa)** e quer
**documentar/organizar** todo o material do curso como histórico e portfólio.

---

## 1. Estado atual (resumo)

O repositório tem **uma pasta por disciplina**, no padrão `CÓDIGO - Nome`, totalizando
**32 disciplinas**. Três submódulos git de projetos reais:

| Submódulo | Caminho | Commit fixado |
|-----------|---------|---------------|
| ChessMate | `ADS306 - .../ChessMate` | `da126c7` (heads/master) |
| DamaLink  | `ADS306 - .../DamaLink`  | `eda01af` (heads/main) |
| TCC_Software | `ADS405 - Gestão de Projetos/TCC_Software` | `097a38e` (heads/main) |

Projetos/artefatos de destaque encontrados (bons para portfólio):
- **TCC_Software** — app Next.js + TypeScript (testes Playwright/Vitest, Docker). [ADS405]
- **ChessMate** e **DamaLink** — apps React Native / Expo (jogos). [ADS306]
- **Inovatech** — projeto com assets/README. [ADS501]
- Apresentações HTML (Rust [ADS108], Cidades Conectadas/IA [ADS308], TicketFlow [ADS405]).
- Notebooks Jupyter de IA (`.ipynb`) — práticas e trabalho prático. [ADS308]

---

## 2. Problemas encontrados na análise

### 2.1 Redundância ("bagunça" + `.rar`)
Pastas literalmente chamadas "bagunça" e arquivos `.rar` que duplicam material já
extraído/organizado:
- `ADS107 - Desenvolvimento Web II/bagunça ads107/` + `bagunça ads107.rar`
- `ADS200 - Organização e Arquitetura de Computadores/bagunça/`
- `ADS201 - Sistemas Operacionais e IOT/bagunça/` + `bagunça ads201.rar`
- `ADS101 - Programação de Computadores II/bagunça ads101` + `bagunça ads101.rar`

### 2.2 Duplicação de subpastas
- **ADS100** — pastas `BernardoMotta_Pratica1..9` existem no topo **e** dentro de
  `Atividades/`. ✅ **Verificado: são idênticas** → consolidar em `Atividades/` e apagar as do topo.
- **ADS202** — `Atividade ER 1`, `Atividade ER 2`, `Praticas BD` existem no topo **e**
  dentro de `Atividades/`. ⚠️ **Verificado: DIFEREM** (`Floricultura.drawio`, `Pratica1..4.sql`).
  → **Decisão necessária** (ver §6): manter as duas versões, ou escolher uma.
- **ADS308** — duplicatas geradas em sessão anterior: `roteiro.md` vs `seminario/roteiro (1).md`
  e `ADS308.html` vs `seminario/ADS308 (1).html`. Também há `ADS308.html` e `ADS308 - revisão.html`
  (mesmo título "Cidades Conectadas"). → consolidar.

### 2.3 Artefatos que não deveriam estar versionados
- Binários compilados `.exe` em `ADS100` (`Atividade4.exe`, `Atividade1.exe`, etc.).
- (Submódulos têm `node_modules`, `.next`, `dist`, `.expo` — governados pelo `.gitignore` deles.)

### 2.4 ⚠️ Segurança
- O submódulo **TCC_Software** contém `.env` e `.env.local` no diretório de trabalho.
  Se estiverem **versionados no repo do submódulo**, podem expor credenciais.
  → **Ação:** verificar no repo do TCC_Software se estão no `.gitignore`; se já foram
  commitados, remover do histórico e **rotacionar segredos**. (Fora do escopo deste repo,
  mas é do mesmo dono.)

### 2.5 Pastas vazias (12) — disciplinas sem material digital
`ADS307`, `ADS310`, `ADS404`, `ADS504`, `ADM235`, `INF126`, `LET104`, `UNI133`, `UNI150`,
`UNI170`, `UNI440`, `UNI506`.
> Obs.: git não versiona pasta vazia. Decidir: `README.md` "sem material" em cada, ou `.gitkeep`.

---

## 3. Padrão de estrutura proposto (por disciplina)

```
CÓDIGO - Nome da Disciplina/
├── README.md          # resumo: período, nota, ementa curta, o que contém, destaques
├── Aulas/             # slides/PDFs de aula, ementa, plano de ensino
├── Atividades/        # listas, exercícios, práticas
├── Projetos/          # trabalhos/projetos maiores (quando houver)
└── Provas/            # avaliações (quando houver)
```
Aplicar de forma pragmática: só criar subpastas que fazem sentido para o conteúdo
existente de cada disciplina (não forçar pastas vazias).

---

## 4. Documentação proposta (camada de portfólio)

1. **README.md raiz** reescrito como índice de portfólio:
   - Apresentação + tabela do currículo (código, disciplina, período, nota, CH) — §5.
   - Seção "Projetos em destaque" com links (TCC_Software, ChessMate, DamaLink, Inovatech).
   - Métricas (total de CH integralizada, média, nº de disciplinas).
2. **README.md por disciplina** (pelo menos nas que têm projeto/código relevante).
3. Manter este `ESTRUTURACAO.md` como registro do processo.

---

## 5. Histórico acadêmico (fonte: histórico colado pelo aluno)

Matrícula: 26351. CH total integralizada informada: 400+400+320+320+120 = **1560h** (+ em curso).

| Período | Código | Disciplina | Situação | Nota | CH |
|---------|--------|------------|----------|------|-----|
| 2024-1 | ADS202 | Banco de Dados | Aprovado | 80,00 | 80h |
| 2024-1 | ADS502 | Desenvolvimento Web I e Projeto Integrador | Aprovado | 88,00 | 80h |
| 2024-1 | UNI133 | Estatística I | Aprovado | 74,00 | 40h |
| 2024-1 | ADS001 | Fundamentos em Análise e Desenvolvimento de Sistemas | Aprovado | 70,00 | 40h |
| 2024-1 | ADS200 | Organização e Arquitetura de Computadores | Aprovado | 75,00 | 80h |
| 2024-1 | ADS100 | Programação de Computadores I | Aprovado | 83,00 | 80h |
| 2024-2 | ADS107 | Desenvolvimento Web II | Aprovado | 76,00 | 40h |
| 2024-2 | ADS501 | Design de Interação e Projeto Integrador | Aprovado | 80,00 | 80h |
| 2024-2 | ADS300 | Engenharia de Software I | Aprovado | 65,00 | 80h |
| 2024-2 | UNI170 | Interpretação e Produção de Textos | Aproveitamento Externo | — | 40h |
| 2022-2 | LET104 | Oficina de Leitura e Produções de Gêneros Acadêmicos | Aprovado | 78,00 | 60h |
| 2024-2 | ADS101 | Programação de Computadores II | Aprovado | 74,00 | 80h |
| 2024-2 | ADS201 | Sistemas Operacionais e IOT | Aprovado | 82,00 | 80h |
| 2025-1 | ADS301 | Engenharia de Software II | Aprovado | 85,00 | 80h |
| 2025-1 | ADS104 | Estrutura de Dados | Aprovado | 70,00 | 80h |
| 2025-1 | ADS503 | Interação Humano Computador e Projeto Integrador | Aprovado | 84,00 | 80h |
| 2025-1 | ADS305 | Redes de Computadores, Sistemas Distribuídos e Cloud Computing | Aprovado | 66,00 | 80h |
| 2025-1 | INF126 | Informática e Sociedade | Aprovado | 64,00 | 40h |
| 2025-2 | ADS504 | Arquitetura de Software e Projeto Integrador | Aprovado | 75,00 | 80h |
| 2025-2 | UNI150 | Empreendedorismo e Inovação | Aprovado | 68,00 | 40h |
| 2025-2 | ADS310 | Gestão de Dados, Big Data e Data Mining | Aprovado | 64,00 | 80h |
| 2025-2 | ADS405 | Gestão de Projetos | Aprovado | 64,00 | 40h |
| 2025-2 | ADS307 | Projeto de Sistemas para Internet | Aprovado | 83,00 | 80h |
| 2025-2 | ADM235 | Empresa Simulada | Aprovado | 67,00 | 80h |
| 2026-1 | ADS306 | Desenvolvimento para Dispositivos Móveis e Games | Matriculado | — | 80h |
| 2026-1 | ADS308 | Inteligência Artificial | Matriculado | — | 80h |
| 2026-1 | ADS404 | Atividades Complementares | Matriculado | — | 40h |
| 2026-1 | ADS505 | Implantação de Soluções em TI e Projeto Integrador | Matriculado | — | 80h |
| 2026-1 | ADS108 | Linguagens de Programação | Matriculado | — | 40h |
| 2026-1 | ADS309 | Segurança e Confiabilidade de Sistemas | Matriculado | — | 40h |
| 2026-1 | UNI440 | Fundamentos de Administração | Matriculado | — | 40h |
| 2026-1 | UNI506 | Homem, Sociedade e Meio Ambiente | Matriculado | — | 40h |
| —      | ADS312 | Optativa (eletiva, não cursada) | — | — | 40h |
| —      | ADS311 | Tópicos Especiais (eletiva, não cursada) | — | — | 40h |

> Nota: pastas de `ADS312 - Optativa` e `ADS311 - Tópicos Especiais` **não** foram criadas
> (decisão do aluno). Elas continuam listadas aqui só para completude do currículo.

---

## 6. Decisões pendentes (precisa do aluno)

1. **Remoção de "bagunça" e `.rar`** (§2.1): confirmar exclusão. São redundantes, mas são exclusões.
2. **ADS202** (§2.2): as versões divergem — manter ambas (ex.: `.../v1` e `.../v2`), ou eu comparo
   e mantenho a mais completa?
3. **`.exe`** (§2.3): confirmar remoção dos binários compilados.
4. **Pastas vazias** (§2.5): `.gitkeep` ou `README.md` "sem material"?
5. **Profundidade da documentação**: só README raiz, ou README por disciplina também?

---

## 7. Log do que já foi feito (sessões anteriores)

- ✅ Criadas pastas faltantes das disciplinas do histórico (padrão `CÓDIGO - Nome`).
- ✅ `ADS311`/`ADS312` **não** criadas (decisão do aluno).
- ✅ Renomeadas p/ nome oficial: `ADS001` (Desenvolvimento), `ADS100` (+ " I", com histórico git),
  `ADS502` (ordem/typo corrigidos).
- ✅ `ADS101`: merge das duas pastas ("2" e "II") em `ADS101 - Programação de Computadores II`.
- ✅ **Games → ADS306**: `Games` era o conteúdo real de mobile; a `ADS306` antiga era cópia
  quebrada (removida). Submódulos movidos via robocopy (VS Code travava `git mv`), `.gitmodules`
  atualizado e gitlinks reinseridos — 3 submódulos apontando para os mesmos commits.
- ✅ `trabalhos faculdade` distribuído (ADS308, ADS108, ADS309, ADS405) e a pasta removida.
- ⚠️ **Tudo isso ainda NÃO foi commitado** — está só no working tree.

## 8. Próximos passos (ordem sugerida)
1. Resolver decisões pendentes (§6).
2. Executar limpeza (bagunça/rar/exe/duplicados) — com confirmação.
3. Consolidar ADS100 / ADS202 / ADS308.
4. Aplicar padrão de subpastas onde fizer sentido.
5. Gerar README raiz (portfólio) + READMEs por disciplina.
6. Commit final organizado.

---

## 9. Execução (sessão 2026-07-02)

Decisões do aluno: apagar `.exe`; **extrair e organizar** os `.rar`/`.zip`; ADS202 =
comparar e manter a melhor; documentação = **só README raiz**; pastas vazias = **README "sem material"**.

Feito:
- ✅ Removidos os **4 `.exe`** (binários compilados em ADS100).
- ✅ Removidas as **3 "bagunça" + 3 `.rar`** (ADS101/107/201) — 100% redundantes com `Aulas/` (verificado).
- ✅ **ADS200**: `bagunça/` tinha conteúdo **único** → Capítulos 10/11/12 Stallings movidos p/ o topo
  (renomeados) e Trabalho Final + 2 exercícios p/ `Atividades/`; 2 listas duplicadas descartadas;
  arquivo do **ADS202 que estava perdido** aqui foi devolvido p/ `ADS202/Atividades/Lista de Exercícios/`.
- ✅ Extraídos e organizados: **`Caso de Uso.rar`** → `ADS301/Caso de Uso/`; **zip de vídeos** → `ADS100/Atividades/Exercícios - Aulas 3 e 4/`. Compactados removidos. (WinRAR UnRAR usado; VS Code não travou.)
- ✅ **ADS100**: removidas as 9 `BernardoMotta_PraticaN` duplicadas do topo (idênticas às de `Atividades/`)
  e demais dups; topo agora só com aulas + `Atividades/` consolidada.
- ✅ **ADS202**: versões do topo eram mais completas (`.sql`/`.drawio` maiores) → consolidadas em
  `Atividades/` (ER 1, ER 2, Praticas BD, Lista de Exercícios), versões antigas descartadas.
- ✅ **ADS308**: pasta `seminario/` (cópias "(1)" idênticas) removida; seminário reorganizado em
  `Seminário/` (Apresentação.html, Apresentação (revisão).html, Roteiro.md, Seminário.pdf).
- ✅ **README "sem material"** criado nas 12 pastas vazias, com período/situação/nota/CH.
- ✅ **README.md raiz** reescrito como portfólio (resumo, métricas, tabela de notas por período,
  projetos em destaque com links, organização, ferramentas).

⚠️ **Ainda NÃO commitado** — tudo continua no working tree, aguardando revisão/commit.

Pendências conhecidas (fora do escopo deste repo):
- Submódulo **TCC_Software** tem `.env`/`.env.local` — verificar versionamento e rotacionar segredos.
