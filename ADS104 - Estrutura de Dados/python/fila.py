"""
Fila (queue, FIFO) em Python.

Usa collections.deque, que oferece inserção/remoção nas duas pontas em O(1)
(uma lista comum teria pop(0) em O(n)).
"""
from __future__ import annotations

from collections import deque
from typing import Any


class Fila:
    def __init__(self) -> None:
        self._dados: deque[Any] = deque()

    def __len__(self) -> int:
        return len(self._dados)

    def vazia(self) -> bool:
        return not self._dados

    def enqueue(self, valor: Any) -> None:
        """Insere no fim da fila. O(1)."""
        self._dados.append(valor)

    def dequeue(self) -> Any:
        """Remove e retorna o elemento da frente. O(1)."""
        if self.vazia():
            raise IndexError("dequeue em fila vazia")
        return self._dados.popleft()

    def frente(self) -> Any:
        """Consulta a frente sem remover. O(1)."""
        if self.vazia():
            raise IndexError("frente em fila vazia")
        return self._dados[0]

    def __str__(self) -> str:
        return "frente -> " + " -> ".join(map(str, self._dados))


if __name__ == "__main__":
    f = Fila()
    for i in range(1, 5):
        f.enqueue(i)            # 1,2,3,4
    print("Fila:       ", f)
    print("Frente:     ", f.frente())    # 1
    print("Dequeue:    ", f.dequeue())   # 1
    print("Dequeue:    ", f.dequeue())   # 2
    f.enqueue(99)
    print("Frente:     ", f.frente())    # 3
    print("Tamanho:    ", len(f))        # 3
