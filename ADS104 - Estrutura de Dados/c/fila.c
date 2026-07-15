/*
 * Fila (queue, FIFO) baseada em lista encadeada com ponteiros para
 * início (frente) e fim (tras) em C.
 *
 * Manter o ponteiro `tras` garante enqueue e dequeue em O(1).
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct No {
    int valor;
    struct No *prox;
} No;

typedef struct {
    No *frente;
    No *tras;
    int tamanho;
} Fila;

void fila_iniciar(Fila *f) {
    f->frente = f->tras = NULL;
    f->tamanho = 0;
}

bool fila_vazia(const Fila *f) {
    return f->frente == NULL;
}

/* Insere no fim da fila. O(1) */
void enqueue(Fila *f, int valor) {
    No *no = (No *) malloc(sizeof(No));
    no->valor = valor;
    no->prox = NULL;
    if (f->tras == NULL) {
        f->frente = f->tras = no;
    } else {
        f->tras->prox = no;
        f->tras = no;
    }
    f->tamanho++;
}

/* Remove e retorna o elemento da frente. Aborta se vazia. O(1) */
int dequeue(Fila *f) {
    if (fila_vazia(f)) {
        fprintf(stderr, "Erro: dequeue em fila vazia\n");
        exit(EXIT_FAILURE);
    }
    No *removido = f->frente;
    int valor = removido->valor;
    f->frente = removido->prox;
    if (f->frente == NULL) f->tras = NULL;  /* ficou vazia */
    free(removido);
    f->tamanho--;
    return valor;
}

/* Consulta a frente sem remover. O(1) */
int frente(const Fila *f) {
    return f->frente->valor;
}

void fila_liberar(Fila *f) {
    while (!fila_vazia(f)) dequeue(f);
}

int main(void) {
    Fila f;
    fila_iniciar(&f);

    for (int i = 1; i <= 4; i++) enqueue(&f, i);  /* 1,2,3,4 */
    printf("Frente:      %d\n", frente(&f));        /* 1 */
    printf("Dequeue:     %d\n", dequeue(&f));       /* 1 */
    printf("Dequeue:     %d\n", dequeue(&f));       /* 2 */
    enqueue(&f, 99);
    printf("Frente:      %d\n", frente(&f));        /* 3 */
    printf("Tamanho:     %d\n", f.tamanho);         /* 3 */

    fila_liberar(&f);
    return 0;
}
