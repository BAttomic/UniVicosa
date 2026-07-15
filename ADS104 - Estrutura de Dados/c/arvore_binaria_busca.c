/*
 * Árvore Binária de Busca (BST) em C.
 *
 * Invariante: para todo nó, subárvore esquerda < nó < subárvore direita.
 * Busca/inserção/remoção são O(altura) — O(log n) em média, O(n) no pior caso.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct No {
    int valor;
    struct No *esq, *dir;
} No;

static No *criar_no(int valor) {
    No *no = (No *) malloc(sizeof(No));
    no->valor = valor;
    no->esq = no->dir = NULL;
    return no;
}

/* Insere mantendo a invariante da BST. Ignora duplicatas. */
No *inserir(No *raiz, int valor) {
    if (raiz == NULL) return criar_no(valor);
    if (valor < raiz->valor)      raiz->esq = inserir(raiz->esq, valor);
    else if (valor > raiz->valor) raiz->dir = inserir(raiz->dir, valor);
    return raiz;
}

/* Busca por valor. */
bool buscar(No *raiz, int valor) {
    while (raiz != NULL) {
        if (valor == raiz->valor) return true;
        raiz = (valor < raiz->valor) ? raiz->esq : raiz->dir;
    }
    return false;
}

/* Menor valor de uma subárvore (nó mais à esquerda). */
static No *minimo(No *raiz) {
    while (raiz->esq != NULL) raiz = raiz->esq;
    return raiz;
}

/* Remove `valor` reencaixando a subárvore. */
No *remover(No *raiz, int valor) {
    if (raiz == NULL) return NULL;
    if (valor < raiz->valor) {
        raiz->esq = remover(raiz->esq, valor);
    } else if (valor > raiz->valor) {
        raiz->dir = remover(raiz->dir, valor);
    } else {
        /* achou: trata 0, 1 ou 2 filhos */
        if (raiz->esq == NULL) { No *d = raiz->dir; free(raiz); return d; }
        if (raiz->dir == NULL) { No *e = raiz->esq; free(raiz); return e; }
        No *sucessor = minimo(raiz->dir);        /* menor da direita */
        raiz->valor = sucessor->valor;
        raiz->dir = remover(raiz->dir, sucessor->valor);
    }
    return raiz;
}

/* Percurso em-ordem (in-order): imprime os valores em ordem crescente. */
void em_ordem(No *raiz) {
    if (raiz == NULL) return;
    em_ordem(raiz->esq);
    printf("%d ", raiz->valor);
    em_ordem(raiz->dir);
}

void liberar(No *raiz) {
    if (raiz == NULL) return;
    liberar(raiz->esq);
    liberar(raiz->dir);
    free(raiz);
}

int main(void) {
    No *raiz = NULL;
    int valores[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) raiz = inserir(raiz, valores[i]);

    printf("Em ordem:    "); em_ordem(raiz); printf("\n");   /* 20 30 40 50 60 70 80 */
    printf("Busca 60?    %s\n", buscar(raiz, 60) ? "sim" : "nao");
    printf("Busca 55?    %s\n", buscar(raiz, 55) ? "sim" : "nao");

    raiz = remover(raiz, 30);    /* nó com dois filhos */
    printf("Sem 30:      "); em_ordem(raiz); printf("\n");   /* 20 40 50 60 70 80 */

    liberar(raiz);
    return 0;
}
