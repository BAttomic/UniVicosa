#include <stdio.h>

int main() {
    int numero, pares = 0, impares = 0;
    int i;

    for (i = 0; i < 10; i++) {
        printf("Digite um numero: ");
        scanf("%d", &numero);

        // Verifica se o número é par ou ímpar
        if (numero % 2 == 0) {
            printf("%d eh par.\n", numero);
            pares++;
        } else {
            printf("%d eh impar.\n", numero);
            impares++;
        }
    }

    // Mostra a quantidade de números pares e ímpares informados
    printf("Quantidade de numeros pares: %d\n", pares);
    printf("Quantidade de numeros impares: %d\n", impares);

    return 0;
}
