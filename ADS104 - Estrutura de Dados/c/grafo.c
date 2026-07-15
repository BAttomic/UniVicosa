/*
 * Grafo não-direcionado com lista de adjacência em C, com percursos
 * em largura (BFS) e em profundidade (DFS).
 *
 * BFS e DFS visitam cada vértice e cada aresta uma vez: O(V + E).
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_VERTICES 100

typedef struct No {
    int destino;
    struct No *prox;
} No;

typedef struct {
    int n;                        /* nº de vértices */
    No *adj[MAX_VERTICES];        /* lista de adjacência */
} Grafo;

void grafo_iniciar(Grafo *g, int n) {
    g->n = n;
    for (int i = 0; i < n; i++) g->adj[i] = NULL;
}

static No *novo_no(int destino) {
    No *no = (No *) malloc(sizeof(No));
    no->destino = destino;
    no->prox = NULL;
    return no;
}

/* Aresta não-direcionada: adiciona nas duas listas. O(1) */
void adicionar_aresta(Grafo *g, int u, int v) {
    No *a = novo_no(v); a->prox = g->adj[u]; g->adj[u] = a;
    No *b = novo_no(u); b->prox = g->adj[v]; g->adj[v] = b;
}

/* Busca em largura a partir de `inicio`. O(V + E) */
void bfs(Grafo *g, int inicio) {
    bool visitado[MAX_VERTICES] = {false};
    int  fila[MAX_VERTICES], frente = 0, tras = 0;

    visitado[inicio] = true;
    fila[tras++] = inicio;

    printf("BFS de %d:   ", inicio);
    while (frente < tras) {
        int u = fila[frente++];
        printf("%d ", u);
        for (No *a = g->adj[u]; a != NULL; a = a->prox) {
            if (!visitado[a->destino]) {
                visitado[a->destino] = true;
                fila[tras++] = a->destino;
            }
        }
    }
    printf("\n");
}

/* Busca em profundidade (recursiva). */
static void dfs_visita(Grafo *g, int u, bool *visitado) {
    visitado[u] = true;
    printf("%d ", u);
    for (No *a = g->adj[u]; a != NULL; a = a->prox) {
        if (!visitado[a->destino]) dfs_visita(g, a->destino, visitado);
    }
}

void dfs(Grafo *g, int inicio) {
    bool visitado[MAX_VERTICES] = {false};
    printf("DFS de %d:   ", inicio);
    dfs_visita(g, inicio, visitado);
    printf("\n");
}

void grafo_liberar(Grafo *g) {
    for (int i = 0; i < g->n; i++) {
        No *a = g->adj[i];
        while (a != NULL) { No *p = a->prox; free(a); a = p; }
        g->adj[i] = NULL;
    }
}

int main(void) {
    Grafo g;
    grafo_iniciar(&g, 6);
    /*    0 - 1     2
     *    |   |   / |
     *    3 - 4 - 5 |          (grafo de exemplo)
     */
    adicionar_aresta(&g, 0, 1);
    adicionar_aresta(&g, 0, 3);
    adicionar_aresta(&g, 1, 4);
    adicionar_aresta(&g, 3, 4);
    adicionar_aresta(&g, 4, 5);
    adicionar_aresta(&g, 2, 5);

    bfs(&g, 0);
    dfs(&g, 0);

    grafo_liberar(&g);
    return 0;
}
