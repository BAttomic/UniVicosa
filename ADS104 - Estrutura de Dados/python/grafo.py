"""
Grafo não-direcionado com lista de adjacência em Python, com percursos
em largura (BFS) e em profundidade (DFS).

BFS e DFS são O(V + E).
"""
from __future__ import annotations

from collections import defaultdict, deque
from typing import Iterator


class Grafo:
    def __init__(self) -> None:
        self._adj: dict[int, list[int]] = defaultdict(list)

    def adicionar_aresta(self, u: int, v: int) -> None:
        """Aresta não-direcionada: registra nas duas listas. O(1)."""
        self._adj[u].append(v)
        self._adj[v].append(u)

    def bfs(self, inicio: int) -> Iterator[int]:
        """Busca em largura a partir de `inicio`. O(V + E)."""
        visitado = {inicio}
        fila = deque([inicio])
        while fila:
            u = fila.popleft()
            yield u
            for viz in self._adj[u]:
                if viz not in visitado:
                    visitado.add(viz)
                    fila.append(viz)

    def dfs(self, inicio: int) -> Iterator[int]:
        """Busca em profundidade (iterativa) a partir de `inicio`. O(V + E)."""
        visitado: set[int] = set()
        pilha = [inicio]
        while pilha:
            u = pilha.pop()
            if u in visitado:
                continue
            visitado.add(u)
            yield u
            # empilha vizinhos em ordem reversa para visitar em ordem crescente
            for viz in reversed(self._adj[u]):
                if viz not in visitado:
                    pilha.append(viz)


if __name__ == "__main__":
    g = Grafo()
    #    0 - 1     2
    #    |   |   / |
    #    3 - 4 - 5 |
    for u, v in [(0, 1), (0, 3), (1, 4), (3, 4), (4, 5), (2, 5)]:
        g.adicionar_aresta(u, v)

    print("BFS de 0:  ", list(g.bfs(0)))
    print("DFS de 0:  ", list(g.dfs(0)))
