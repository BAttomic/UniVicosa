"""
Lista encadeada simples (singly linked list) em Python.

Cada nó guarda um valor e a referência para o próximo nó. A lista mantém
apenas a referência para a cabeça (head) e o tamanho atual.

Versão idiomática da mesma estrutura implementada em C neste repositório.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterator, Optional


@dataclass
class No:
    valor: Any
    prox: Optional["No"] = None


class ListaEncadeada:
    def __init__(self) -> None:
        self.head: Optional[No] = None
        self._tamanho = 0

    def __len__(self) -> int:
        return self._tamanho

    def __iter__(self) -> Iterator[Any]:
        atual = self.head
        while atual is not None:
            yield atual.valor
            atual = atual.prox

    def inserir_inicio(self, valor: Any) -> None:
        """Insere na cabeça. O(1)."""
        self.head = No(valor, self.head)
        self._tamanho += 1

    def inserir_fim(self, valor: Any) -> None:
        """Insere no fim. O(n) — percorre até o último nó."""
        novo = No(valor)
        if self.head is None:
            self.head = novo
        else:
            atual = self.head
            while atual.prox is not None:
                atual = atual.prox
            atual.prox = novo
        self._tamanho += 1

    def remover(self, valor: Any) -> bool:
        """Remove a primeira ocorrência de `valor`. Retorna True se removeu. O(n)."""
        atual = self.head
        anterior: Optional[No] = None
        while atual is not None and atual.valor != valor:
            anterior = atual
            atual = atual.prox
        if atual is None:
            return False
        if anterior is None:
            self.head = atual.prox        # removendo a cabeça
        else:
            anterior.prox = atual.prox
        self._tamanho -= 1
        return True

    def buscar(self, valor: Any) -> bool:
        """True se `valor` está na lista. O(n)."""
        return valor in self

    def __str__(self) -> str:
        return "[" + " -> ".join(str(v) for v in self) + "]"


if __name__ == "__main__":
    lista = ListaEncadeada()

    lista.inserir_fim(10)
    lista.inserir_fim(20)
    lista.inserir_inicio(5)
    lista.inserir_fim(30)
    print("Lista:       ", lista)              # [5 -> 10 -> 20 -> 30]
    print("Tamanho:     ", len(lista))         # 4

    print("Busca 20?    ", lista.buscar(20))   # True
    print("Busca 99?    ", lista.buscar(99))   # False

    lista.remover(5)                            # remove a cabeça
    lista.remover(20)                           # remove no meio
    print("Apos remover:", lista)              # [10 -> 30]
