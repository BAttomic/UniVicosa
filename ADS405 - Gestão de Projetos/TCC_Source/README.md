<h1 align="center">📘 Sistema Web Escalável para Venda de Ingressos Online</h1>

<p align="center">
  <b>Monografia (LaTeX)</b> do Trabalho de Conclusão — a fundamentação teórica e o projeto
  de arquitetura do sistema implementado em <a href="../TCC_Software">TicketFlow</a>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/LaTeX-ABNT-008080?logo=latex&logoColor=white" alt="LaTeX"/>
  <img src="https://img.shields.io/badge/classe-tcc.cls-555" alt="tcc.cls"/>
  <img src="https://img.shields.io/badge/UniVi%C3%A7osa-2026-1E6FBA" alt="UniViçosa"/>
</p>

<p align="center">
  <b>Autores:</b> Edson Ramos da Silva Junior · Bernardo Cordeiro Motta &nbsp;|&nbsp; Viçosa, 2026
</p>

---

## 🧭 Sobre

Documento acadêmico (norma **ABNT**) que descreve o problema, a pesquisa e a **arquitetura de software** de uma plataforma escalável de venda de ingressos online. O software correspondente está em **[`../TCC_Software`](../TCC_Software)** (Next.js + MongoDB).

📄 **PDF compilado:** [`../TCC_Software/public/tcc.pdf`](../TCC_Software/public/tcc.pdf)

## 🗂️ Estrutura

```
tcc-ingressos.tex        # arquivo principal (raiz do documento)
pretextual-config.tex    # configuração dos elementos pré-textuais
pretextual-dados.tex     # título, autores, instituição, data
PreTextual/              # capa, folha de rosto, resumo, sumário
Textual/                 # desenvolvimento (capítulos)
PosTextual/              # referências, apêndices, anexos
classe/                  # tcc.cls + ABNT6023-10520.sty (classe e estilo)
uni-bib/                 # modelo-references.bib (bibliografia BibTeX)
img/                     # figuras
```

## 🛠️ Como compilar

**Requisitos:** uma distribuição LaTeX (TeX Live / MiKTeX) com `pdflatex`, `bibtex` e `makeindex`.

Forma simples (resolve bibliografia, índice e reruns automaticamente):

```bash
latexmk -pdf tcc-ingressos.tex
```

Ou manualmente (fluxo ABNT com bibliografia + índice):

```bash
pdflatex tcc-ingressos
bibtex   tcc-ingressos
makeindex tcc-ingressos
pdflatex tcc-ingressos
pdflatex tcc-ingressos
```

O PDF final é gerado como `tcc-ingressos.pdf`. Para limpar os auxiliares: `latexmk -c`.

---

<p align="center">
  <sub>📚 <b>ADS405 — Gestão de Projetos</b> · Trabalho Prático de Arquitetura de Software · Análise e Desenvolvimento de Sistemas — UniViçosa</sub><br/>
  <sub>Parte do repositório-portfólio <a href="../../">UniVicosa</a> · Curso concluído 🎓 · 👤 Bernardo Cordeiro Motta</sub>
</p>
