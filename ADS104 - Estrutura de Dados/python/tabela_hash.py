"""
Tabela Hash (chave -> valor) com encadeamento separado em Python.

Implementada "na mão" (baldes = lista de listas) para demonstrar o
funcionamento interno — em produção usaríamos o dict nativo.
put/get/remove são O(1) em média; O(n) com muitas colisões.
"""
from __future__ import annotations

from typing import Any, Optional


class TabelaHash:
    def __init__(self, n_baldes: int = 16) -> None:
        self._n = n_baldes
        self._baldes: list[list[tuple[Any, Any]]] = [[] for _ in range(n_baldes)]
        self._tamanho = 0

    def __len__(self) -> int:
        return self._tamanho

    def _indice(self, chave: Any) -> int:
        # hash() nativo do Python, reduzido ao nº de baldes
        return hash(chave) % self._n

    def put(self, chave: Any, valor: Any) -> None:
        """Insere ou atualiza. O(1) médio."""
        balde = self._baldes[self._indice(chave)]
        for i, (k, _) in enumerate(balde):
            if k == chave:
                balde[i] = (chave, valor)   # atualiza
                return
        balde.append((chave, valor))
        self._tamanho += 1

    def get(self, chave: Any) -> Optional[Any]:
        """Retorna o valor ou None. O(1) médio."""
        for k, v in self._baldes[self._indice(chave)]:
            if k == chave:
                return v
        return None

    def remover(self, chave: Any) -> bool:
        """Remove a chave. Retorna True se removeu. O(1) médio."""
        balde = self._baldes[self._indice(chave)]
        for i, (k, _) in enumerate(balde):
            if k == chave:
                balde.pop(i)
                self._tamanho -= 1
                return True
        return False

    def __contains__(self, chave: Any) -> bool:
        return self.get(chave) is not None


if __name__ == "__main__":
    t = TabelaHash()
    t.put("bernardo", 26351)
    t.put("idade", 23)
    t.put("idade", 24)          # atualiza

    print("bernardo -> ", t.get("bernardo"))   # 26351
    print("idade    -> ", t.get("idade"))       # 24
    print("tem 'curso'?", "curso" in t)         # False
    t.remover("idade")
    print("tem 'idade'?", "idade" in t)         # False
    print("tamanho:    ", len(t))               # 1
