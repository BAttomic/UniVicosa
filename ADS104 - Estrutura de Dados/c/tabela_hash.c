/*
 * Tabela Hash (chave string -> valor int) com encadeamento separado
 * (separate chaining) em C.
 *
 * Colisões são resolvidas por listas encadeadas em cada balde (bucket).
 * Com boa distribuição, put/get/remove são O(1) em média.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define N_BALDES 16

typedef struct Entrada {
    char *chave;
    int   valor;
    struct Entrada *prox;
} Entrada;

typedef struct {
    Entrada *baldes[N_BALDES];
} TabelaHash;

/* Função hash djb2 (Dan Bernstein) reduzida ao nº de baldes. */
static unsigned int hash(const char *chave) {
    unsigned long h = 5381;
    int c;
    while ((c = *chave++)) h = ((h << 5) + h) + c;  /* h * 33 + c */
    return h % N_BALDES;
}

void tabela_iniciar(TabelaHash *t) {
    for (int i = 0; i < N_BALDES; i++) t->baldes[i] = NULL;
}

/* Insere ou atualiza o valor da chave. O(1) médio. */
void put(TabelaHash *t, const char *chave, int valor) {
    unsigned int i = hash(chave);
    for (Entrada *e = t->baldes[i]; e != NULL; e = e->prox) {
        if (strcmp(e->chave, chave) == 0) { e->valor = valor; return; }  /* atualiza */
    }
    Entrada *nova = (Entrada *) malloc(sizeof(Entrada));
    nova->chave = strdup(chave);
    nova->valor = valor;
    nova->prox = t->baldes[i];   /* insere na frente do balde */
    t->baldes[i] = nova;
}

/* Busca o valor da chave em `saida`. Retorna true se achou. O(1) médio. */
bool get(TabelaHash *t, const char *chave, int *saida) {
    unsigned int i = hash(chave);
    for (Entrada *e = t->baldes[i]; e != NULL; e = e->prox) {
        if (strcmp(e->chave, chave) == 0) { *saida = e->valor; return true; }
    }
    return false;
}

/* Remove a chave. Retorna true se removeu. O(1) médio. */
bool remover(TabelaHash *t, const char *chave) {
    unsigned int i = hash(chave);
    Entrada *atual = t->baldes[i], *anterior = NULL;
    while (atual != NULL) {
        if (strcmp(atual->chave, chave) == 0) {
            if (anterior == NULL) t->baldes[i] = atual->prox;
            else anterior->prox = atual->prox;
            free(atual->chave);
            free(atual);
            return true;
        }
        anterior = atual;
        atual = atual->prox;
    }
    return false;
}

void tabela_liberar(TabelaHash *t) {
    for (int i = 0; i < N_BALDES; i++) {
        Entrada *e = t->baldes[i];
        while (e != NULL) {
            Entrada *prox = e->prox;
            free(e->chave);
            free(e);
            e = prox;
        }
        t->baldes[i] = NULL;
    }
}

int main(void) {
    TabelaHash t;
    tabela_iniciar(&t);

    put(&t, "bernardo", 26351);
    put(&t, "idade", 23);
    put(&t, "idade", 24);      /* atualiza */

    int v;
    if (get(&t, "bernardo", &v)) printf("bernardo ->  %d\n", v);  /* 26351 */
    if (get(&t, "idade", &v))    printf("idade    ->  %d\n", v);  /* 24 */
    printf("tem 'curso'? %s\n", get(&t, "curso", &v) ? "sim" : "nao");

    remover(&t, "idade");
    printf("apos remover, tem 'idade'? %s\n", get(&t, "idade", &v) ? "sim" : "nao");

    tabela_liberar(&t);
    return 0;
}
