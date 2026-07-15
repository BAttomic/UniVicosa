# ADS104 — Estrutura de Dados

> Período: 2025-1 · Situação: Aprovado

A disciplina não deixou artefatos digitais de entrega. Para não deixar um tema central
da formação vazio, implementei **do zero** as principais estruturas de dados, em **C** e
em **Python**, com foco em entender o funcionamento interno e o custo de cada operação.

> Estas são implementações de estudo — escritas para fixar o conteúdo, não bibliotecas
> de produção. O objetivo é demonstrar entendimento, não reinventar a `std`.

## 📂 Organização

```
ADS104 - Estrutura de Dados/
├── c/        → implementações em C (ponteiros, alocação manual)
└── python/   → mesmas estruturas, versão idiomática em Python
```

Cada arquivo é autocontido e traz um pequeno teste no final
(`main` em C / bloco `if __name__ == "__main__"` em Python).

## 🧮 Complexidade (Big-O)

| Estrutura | Acesso | Busca | Inserção | Remoção | Observação |
|---|---|---|---|---|---|
| Lista encadeada | O(n) | O(n) | O(1)¹ | O(1)¹ | ¹na cabeça; O(n) em posição arbitrária |
| Pilha (LIFO) | O(1)² | O(n) | O(1) | O(1) | ²apenas o topo |
| Fila (FIFO) | O(1)² | O(n) | O(1) | O(1) | ²apenas as pontas |
| Árvore Binária de Busca | O(log n)³ | O(log n)³ | O(log n)³ | O(log n)³ | ³médio; O(n) no pior caso (degenerada) |
| Tabela Hash | — | O(1)⁴ | O(1)⁴ | O(1)⁴ | ⁴médio; O(n) com muitas colisões |
| Grafo (BFS/DFS) | — | O(V+E) | O(1)⁵ | O(V+E) | ⁵adição de aresta em lista de adjacência |

## ▶️ Como rodar

**C** (gcc):
```bash
gcc "c/lista_encadeada.c" -o lista && ./lista
```

**Python** (3.10+):
```bash
python "python/lista_encadeada.py"
```

## ✅ Estruturas implementadas

Todas em **C** e **Python**, cada arquivo com teste embutido (compilado/executado):

- [x] Lista encadeada
- [x] Pilha (LIFO)
- [x] Fila (FIFO)
- [x] Árvore Binária de Busca
- [x] Tabela Hash (encadeamento separado)
- [x] Grafo (BFS/DFS)
