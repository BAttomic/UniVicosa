#include <stdio.h>

int main() {
    int numero;
    printf("Digite um n�mero inteiro: ");
    scanf("%d", &numero);

    // Verifica se o n�mero � divis�vel por 2
    if (numero % 2 == 0) {
        printf("%d � um n�mero par.\n", numero);
    } else {
        printf("%d � um n�mero �mpar.\n", numero);
    }

    return 0;
}
