"""
Árvore Binária de Busca (BST) em Python.

Invariante: para todo nó, subárvore esquerda < nó < subárvore direita.
Busca/inserção/remoção são O(altura): O(log n) em média, O(n) no pior caso.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterator, Optional


@dataclass
class No:
    valor: int
    esq: Optional["No"] = None
    dir: Optional["No"] = None


class ArvoreBinariaBusca:
    def __init__(self) -> None:
        self.raiz: Optional[No] = None

    def inserir(self, valor: int) -> None:
        self.raiz = self._inserir(self.raiz, valor)

    def _inserir(self, no: Optional[No], valor: int) -> No:
        if no is None:
            return No(valor)
        if valor < no.valor:
            no.esq = self._inserir(no.esq, valor)
        elif valor > no.valor:
            no.dir = self._inserir(no.dir, valor)
        # valor igual: ignora duplicata
        return no

    def buscar(self, valor: int) -> bool:
        no = self.raiz
        while no is not None:
            if valor == no.valor:
                return True
            no = no.esq if valor < no.valor else no.dir
        return False

    def remover(self, valor: int) -> None:
        self.raiz = self._remover(self.raiz, valor)

    def _remover(self, no: Optional[No], valor: int) -> Optional[No]:
        if no is None:
            return None
        if valor < no.valor:
            no.esq = self._remover(no.esq, valor)
        elif valor > no.valor:
            no.dir = self._remover(no.dir, valor)
        else:
            if no.esq is None:
                return no.dir
            if no.dir is None:
                return no.esq
            sucessor = self._minimo(no.dir)          # menor da direita
            no.valor = sucessor.valor
            no.dir = self._remover(no.dir, sucessor.valor)
        return no

    @staticmethod
    def _minimo(no: No) -> No:
        while no.esq is not None:
            no = no.esq
        return no

    def em_ordem(self) -> Iterator[int]:
        """Percurso in-order → valores em ordem crescente."""
        yield from self._em_ordem(self.raiz)

    def _em_ordem(self, no: Optional[No]) -> Iterator[int]:
        if no is None:
            return
        yield from self._em_ordem(no.esq)
        yield no.valor
        yield from self._em_ordem(no.dir)


if __name__ == "__main__":
    arv = ArvoreBinariaBusca()
    for v in (50, 30, 70, 20, 40, 60, 80):
        arv.inserir(v)

    print("Em ordem:  ", list(arv.em_ordem()))   # [20, 30, 40, 50, 60, 70, 80]
    print("Busca 60?  ", arv.buscar(60))          # True
    print("Busca 55?  ", arv.buscar(55))          # False
    arv.remover(30)                                # nó com dois filhos
    print("Sem 30:    ", list(arv.em_ordem()))    # [20, 40, 50, 60, 70, 80]
