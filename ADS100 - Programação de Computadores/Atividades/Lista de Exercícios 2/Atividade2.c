#include <stdio.h>

int main() {
    int numero;
    printf("Digite um número inteiro: ");
    scanf("%d", &numero);

    // Verifica se o número é divisível por 2
    if (numero % 2 == 0) {
        printf("%d é um número par.\n", numero);
    } else {
        printf("%d é um número ímpar.\n", numero);
    }

    return 0;
}
