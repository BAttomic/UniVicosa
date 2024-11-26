#include <stdio.h>

int main() {
    // Definição dos vetores com 50 elementos
    int VETA[50], VETB[50], VETR[50];
    
    // Variável de controle do loop
    int X;

    // Loop para preencher os vetores VETA e VETB, e calcular VETR
    for (X = 0; X < 50; X++) {
        // Leitura dos valores para VETA e VETB
        printf("Digite o valor para VETA[%d]: ", X + 1);
        scanf("%d", &VETA[X]);

        printf("Digite o valor para VETB[%d]: ", X + 1);
        scanf("%d", &VETB[X]);

        // Calcula o valor de VETR como a soma dos valores de VETA e VETB
        VETR[X] = VETA[X] + VETB[X];

        // Escreve o valor de VETR
        printf("VETR[%d] = %d\n", X + 1, VETR[X]);
    }

    getch();
    return 0;
}
