#include <stdio.h>

int main() {
    int numero, pares = 0, impares = 0;
    int i;

    for (i = 0; i < 10; i++) {
        printf("Digite um numero: ");
        scanf("%d", &numero);

        // Verifica se o n�mero � par ou �mpar
        if (numero % 2 == 0) {
            printf("%d eh par.\n", numero);
            pares++;
        } else {
            printf("%d eh impar.\n", numero);
            impares++;
        }
    }

    // Mostra a quantidade de n�meros pares e �mpares informados
    printf("Quantidade de numeros pares: %d\n", pares);
    printf("Quantidade de numeros impares: %d\n", impares);

    return 0;
}
