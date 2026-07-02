// Feito por 25398 - Marcos Vinícius Nogueira Martins e 26351 - Bernardo Cordeiro Motta

#include <stdio.h>
#include <conio.h>

#define TAMANHO 8

int main() {
    int matriz[TAMANHO][TAMANHO];
    int simetrica = 1; // Assume que a matriz é simétrica até que se prove o contrário

    // Preenche a matriz com valores fornecidos pelo usuário
    printf("Digite os elementos da matriz 8x8:\n");
    for (int i = 0; i < TAMANHO; i++) {
        for (int j = 0; j < TAMANHO; j++) {
            printf("Elemento [%d][%d]: ", i, j);
            scanf("%d", &matriz[i][j]);
        }
    }

    // Verifica se a matriz é simétrica
    for (int i = 0; i < TAMANHO; i++) {
        for (int j = 0; j < TAMANHO; j++) {
            if (matriz[i][j] != matriz[j][i]) {
                simetrica = 0;
                break;
            }
        }
        if (!simetrica) {
            break;
        }
    }

    if (simetrica) {
        printf("A matriz é simétrica.\n");
    } else {
        printf("A matriz não é simétrica.\n");
    }

    getch();
    return 0;
}
