"""
Pilha (stack, LIFO) em Python.

Encapsula uma lista para expor apenas a semântica de pilha (push/pop/topo).
Todas as operações de topo são O(1) amortizado.
"""
from __future__ import annotations

from typing import Any


class Pilha:
    def __init__(self) -> None:
        self._dados: list[Any] = []

    def __len__(self) -> int:
        return len(self._dados)

    def vazia(self) -> bool:
        return not self._dados

    def push(self, valor: Any) -> None:
        """Empilha no topo. O(1)."""
        self._dados.append(valor)

    def pop(self) -> Any:
        """Desempilha o topo. O(1)."""
        if self.vazia():
            raise IndexError("pop em pilha vazia")
        return self._dados.pop()

    def topo(self) -> Any:
        """Consulta o topo sem remover. O(1)."""
        if self.vazia():
            raise IndexError("topo em pilha vazia")
        return self._dados[-1]

    def __str__(self) -> str:
        return "base " + " | ".join(map(str, self._dados)) + " topo"


if __name__ == "__main__":
    p = Pilha()
    for i in range(1, 6):
        p.push(i * 10)          # 10..50
    print("Pilha:      ", p)
    print("Topo:       ", p.topo())   # 50
    print("Pop:        ", p.pop())    # 50
    print("Pop:        ", p.pop())    # 40
    print("Topo agora: ", p.topo())   # 30
    print("Vazia?      ", p.vazia())  # False
