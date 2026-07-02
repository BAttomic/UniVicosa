#include <stdio.h>

int main() {
    // Definição dos vetores com 10 elementos
    int vetor1[10] = {3, 5, 4, 2, 2, 5, 3, 2, 5, 9};
    int vetor2[10] = {7, 15, 20, 0, 18, 4, 55, 23, 8, 6};
    int intercalado[20];

    // Variável de controle do loop
    int i, j = 0;

    // Loop para intercalar os vetores
    for (i = 0; i < 10; i++) 
        intercalado[j++] = vetor1[i];
        intercalado[j++] = vetor2[i];
    }

    // Imprime o vetor intercalado
    printf("Vetor intercalado:\n");
    for (i = 0; i < 20; i++) {
        printf("%d ", intercalado[i]);
    }
    printf("\n");

    getch();
    return 0;
}
