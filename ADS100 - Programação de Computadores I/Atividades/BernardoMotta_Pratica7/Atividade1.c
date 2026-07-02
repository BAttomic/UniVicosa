#include <stdio.h>

int main() {
    // Declarando o vetor A com 100 elementos
    int A[100];
    
    // Variável de controle do loop
    int i;

    // Loop para preencher o vetor A
    for (i = 0; i < 100; i++) {
        if ((i + 1) % 2 != 0) {
            A[i] = 1;
        } else {
            A[i] = 0;
        }
    }

    // Imprimir o vetor para verificar o resultado
    for (i = 0; i < 100; i++) {
        printf("%d ", A[i]);
    }

    getch();
    return 0;
}
