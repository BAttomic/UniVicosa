/*
 * Lista encadeada simples (singly linked list) em C.
 *
 * Cada nó guarda um inteiro e um ponteiro para o próximo nó.
 * A lista mantém apenas o ponteiro para a cabeça (head).
 *
 * Operações: inserir no início, inserir no fim, remover por valor,
 * buscar por valor, imprimir e liberar a memória.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct No {
    int valor;
    struct No *prox;
} No;

/* Cria um novo nó já com o valor e prox = NULL. O(1) */
static No *criar_no(int valor) {
    No *no = (No *) malloc(sizeof(No));
    if (no == NULL) {
        fprintf(stderr, "Erro: memória insuficiente\n");
        exit(EXIT_FAILURE);
    }
    no->valor = valor;
    no->prox = NULL;
    return no;
}

/* Insere na cabeça da lista. O(1) */
void inserir_inicio(No **head, int valor) {
    No *no = criar_no(valor);
    no->prox = *head;
    *head = no;
}

/* Insere no fim da lista. O(n) — precisa percorrer até o último nó. */
void inserir_fim(No **head, int valor) {
    No *no = criar_no(valor);
    if (*head == NULL) {
        *head = no;
        return;
    }
    No *atual = *head;
    while (atual->prox != NULL) {
        atual = atual->prox;
    }
    atual->prox = no;
}

/* Remove a primeira ocorrência de `valor`. Retorna true se removeu. O(n) */
bool remover(No **head, int valor) {
    No *atual = *head;
    No *anterior = NULL;
    while (atual != NULL && atual->valor != valor) {
        anterior = atual;
        atual = atual->prox;
    }
    if (atual == NULL) return false;      /* não encontrado */
    if (anterior == NULL) {
        *head = atual->prox;              /* removendo a cabeça */
    } else {
        anterior->prox = atual->prox;
    }
    free(atual);
    return true;
}

/* Retorna true se `valor` está na lista. O(n) */
bool buscar(No *head, int valor) {
    for (No *atual = head; atual != NULL; atual = atual->prox) {
        if (atual->valor == valor) return true;
    }
    return false;
}

/* Imprime a lista no formato [a -> b -> c]. O(n) */
void imprimir(No *head) {
    printf("[");
    for (No *atual = head; atual != NULL; atual = atual->prox) {
        printf("%d", atual->valor);
        if (atual->prox != NULL) printf(" -> ");
    }
    printf("]\n");
}

/* Libera todos os nós. O(n) */
void liberar(No **head) {
    No *atual = *head;
    while (atual != NULL) {
        No *proximo = atual->prox;
        free(atual);
        atual = proximo;
    }
    *head = NULL;
}

/* Teste rápido das operações. */
int main(void) {
    No *lista = NULL;

    inserir_fim(&lista, 10);
    inserir_fim(&lista, 20);
    inserir_inicio(&lista, 5);
    inserir_fim(&lista, 30);
    printf("Lista:        ");
    imprimir(lista);                       /* [5 -> 10 -> 20 -> 30] */

    printf("Busca 20?     %s\n", buscar(lista, 20) ? "sim" : "nao");
    printf("Busca 99?     %s\n", buscar(lista, 99) ? "sim" : "nao");

    remover(&lista, 5);                     /* remove a cabeça */
    remover(&lista, 20);                    /* remove no meio */
    printf("Apos remover: ");
    imprimir(lista);                        /* [10 -> 30] */

    liberar(&lista);
    return 0;
}
