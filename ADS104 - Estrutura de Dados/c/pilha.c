/*
 * Pilha (stack, LIFO) baseada em arranjo dinâmico em C.
 *
 * Cresce automaticamente (dobra a capacidade) quando enche.
 * Operações de topo (push/pop/peek) são O(1) amortizado.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct {
    int *dados;
    int  tamanho;     /* nº de elementos */
    int  capacidade;  /* espaço alocado  */
} Pilha;

void pilha_iniciar(Pilha *p) {
    p->capacidade = 4;
    p->tamanho = 0;
    p->dados = (int *) malloc(p->capacidade * sizeof(int));
}

bool pilha_vazia(const Pilha *p) {
    return p->tamanho == 0;
}

/* Empilha no topo. O(1) amortizado (dobra a capacidade quando cheia). */
void push(Pilha *p, int valor) {
    if (p->tamanho == p->capacidade) {
        p->capacidade *= 2;
        p->dados = (int *) realloc(p->dados, p->capacidade * sizeof(int));
    }
    p->dados[p->tamanho++] = valor;
}

/* Desempilha o topo. Aborta se vazia. O(1) */
int pop(Pilha *p) {
    if (pilha_vazia(p)) {
        fprintf(stderr, "Erro: pop em pilha vazia\n");
        exit(EXIT_FAILURE);
    }
    return p->dados[--p->tamanho];
}

/* Consulta o topo sem remover. O(1) */
int topo(const Pilha *p) {
    return p->dados[p->tamanho - 1];
}

void pilha_liberar(Pilha *p) {
    free(p->dados);
    p->dados = NULL;
    p->tamanho = p->capacidade = 0;
}

int main(void) {
    Pilha p;
    pilha_iniciar(&p);

    for (int i = 1; i <= 5; i++) push(&p, i * 10);  /* 10..50 */
    printf("Topo:        %d\n", topo(&p));            /* 50 */
    printf("Pop:         %d\n", pop(&p));             /* 50 */
    printf("Pop:         %d\n", pop(&p));             /* 40 */
    printf("Topo agora:  %d\n", topo(&p));            /* 30 */
    printf("Vazia?       %s\n", pilha_vazia(&p) ? "sim" : "nao");

    pilha_liberar(&p);
    return 0;
}
