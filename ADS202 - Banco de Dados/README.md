<h1 align="center">🗄️ ADS202 — Banco de Dados</h1>

<p align="center">
  Modelagem de dados <b>Entidade-Relacionamento</b> e <b>SQL</b>, com base em Elmasri &amp; Navathe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Modelagem-ER-4B8BBE" alt="ER"/>
  <img src="https://img.shields.io/badge/SQL-MySQL-4479A1?logo=mysql&logoColor=white" alt="SQL"/>
  <img src="https://img.shields.io/badge/período-2024--1-555" alt="Período"/>
  <img src="https://img.shields.io/badge/situação-Aprovado-2E7D32" alt="Situação"/>
</p>

---

## 📌 O que a disciplina cobriu

- **Modelagem conceitual** — diagramas Entidade-Relacionamento (entidades, atributos, relacionamentos, cardinalidade, entidades fracas).
- **Modelo relacional** — mapeamento ER → tabelas, chaves primárias/estrangeiras, normalização.
- **SQL** — DDL (criação de esquema), DML (inserção/atualização), consultas com junções, agregações e subconsultas.

## 🧩 Modelagem Entidade-Relacionamento

Exemplos de diagramas ER modelados na disciplina (`Atividades/Atividade ER 02/`):

| Domínio legislativo | Domínio esportivo |
|:---:|:---:|
| ![ER — Estado, Deputado, Projeto de Lei](Atividades/Atividade%20ER%2002/ER1.png) | ![ER — Time, Jogador, Jogo](Atividades/Atividade%20ER%2002/ER2.png) |
| Estados, deputados e projetos de lei (votou / sancionou / representado). | Times, jogadores, jogos e resultados de um campeonato. |

> Outros modelos (fonte `.drawio`) em `Atividades/Atividade ER 01/`: **Biblioteca**, **Escola** e **Floricultura**.

## 💻 Práticas SQL

Quatro práticas em [`Atividades/Práticas/`](<Atividades/Práticas>) — scripts `Pratica1.sql` … `Pratica4.sql` com os enunciados correspondentes em PDF.

## 📝 Listas & referências

- **Listas 01–03** (enunciados + resoluções) em [`Atividades/Listas/`](<Atividades/Listas>).
- Bibliografia em [`Referências.md`](Referências.md) — *ELMASRI &amp; NAVATHE, Sistemas de Banco de Dados, 6ª ed.*

## 🗂️ Estrutura

```
Atividades/
  Atividade ER 01/   # Biblioteca, Escola, Floricultura (.drawio) + enunciado
  Atividade ER 02/   # ER1/ER2 (.drawio + .png) + resolução
  Listas/            # Listas 01–03 (enunciados + resoluções)
  Práticas/          # Pratica1–4.sql + enunciados
Referências.md
```

---

<p align="center">
  <sub>📚 <b>ADS202 — Banco de Dados</b> · Análise e Desenvolvimento de Sistemas — UniViçosa</sub><br/>
  <sub>Parte do repositório-portfólio <a href="../">UniVicosa</a> · Curso concluído 🎓 · 👤 Bernardo Cordeiro Motta</sub>
</p>
