# 🗂️ Estruturação do Repositório

Este documento registra a **análise** e o **padrão de organização** adotados neste
repositório-portfólio, além do histórico da reorganização feita nos arquivos e pastas.

<img src="https://capsule-render.vercel.app/api?type=rect&color=timeGradient&height=2" width="100%"/>

## 🎯 Objetivo

Manter todo o material da graduação organizado, com nomes que:

- **dizem o que é** o arquivo (tipo + conteúdo), sem depender da pasta;
- **ordenam corretamente** na visualização alfabética do explorador/GitHub;
- ficam **consistentes** entre todas as disciplinas.

<img src="https://capsule-render.vercel.app/api?type=rect&color=timeGradient&height=2" width="100%"/>

## 📛 Padrão de nomes

Formato geral: **`Tipo NN - Descrição.ext`**

- **Números com zero à esquerda** (`01, 02 … 10, 11`) — assim a ordem alfabética
  coincide com a ordem real.
- **Aulas** são numeradas na **ordem cronológica** em que foram dadas (a data foi
  usada apenas para ordenar e depois descartada) e sempre carregam um **contexto**:
  `Aula 07 - Herança.pdf`.
- **Enunciado × Resolução** ficam separados quando ambos existem:
  `Lista 02 - Enunciado.pdf` e `Lista 02 - Resolução.pdf`.
- **Livros** inteiros: `Livro - Título (Autor).pdf`.
- **Capítulos** de livro: `Capítulo NN - Autor.pdf`.
- **Prefixos de exportação da plataforma** (ex.: `2026310_211031_…`) foram **removidos**.

### Tipos (prefixos) usados

`Aula` · `Lista` · `Prática` · `Trabalho` · `Trabalho Final` · `Trabalho Prático` ·
`Seminário` · `Atividade` · `Exercícios` · `Prova` · `Teste Surpresa` · `Livro` ·
`Capítulo` · `Artigo` · `Monografia` · `Ementa` · `Plano de Ensino` · `Apresentação` ·
`Orientações` · `Exemplo`.

<img src="https://capsule-render.vercel.app/api?type=rect&color=timeGradient&height=2" width="100%"/>

## 📁 Estrutura por disciplina

- Uma pasta por disciplina, no padrão **`CÓDIGO - Nome da Disciplina`**.
- Dentro de cada pasta, o material é separado por tipo quando faz sentido:
  `Aulas/`, `Atividades/`, `Práticas/`, `Listas/`, `Seminário/`, `Trabalho - …/`.
- Disciplinas sem material digital têm um `README.md` com os dados da disciplina.

<img src="https://capsule-render.vercel.app/api?type=rect&color=timeGradient&height=2" width="100%"/>

## 🚫 O que **não** é renomeado

Para não quebrar builds, imports ou referências:

- **Projetos de código**: `TCC_Software`, `TCC_Source` (LaTeX), `ChessMate`, `DamaLink`,
  `Inovatech`.
- **Notebooks e datasets** de IA (`.ipynb`, `.csv`) — os notebooks carregam os `.csv`
  pelo nome.
- **Assets referenciados**: imagens do TCC em LaTeX (`\includegraphics`), arquivos
  `index.html` (convenção web).

<img src="https://capsule-render.vercel.app/api?type=rect&color=timeGradient&height=2" width="100%"/>

## 🧾 Histórico da reorganização — julho/2026

- Padronização de **~250 arquivos** em **19 disciplinas** com material digital.
- **Duplicatas consolidadas** (arquivo original da plataforma × cópia renomeada do
  mesmo conteúdo → mantida uma versão).
- **Slides de aula** (pastas `Aulas/`) passaram a ser **versionados** no repositório.
- Arquivos com nome genérico (`Trabalho.pdf`, `Documento 1.pdf`, `A01.pdf`, …) foram
  abertos e renomeados pelo **conteúdo real**.
- Pastas com nome de data ou com o nome do aluno (`BernardoMotta_Pratica1`,
  `Prova1_BernardoCordeiroMotta`, `03202024`, …) foram padronizadas
  (`Prática 01`, `Prova 01`, `Prática 01 (20-03)`, …).
- Removido material arquivado por engano na disciplina errada.
