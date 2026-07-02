#include <stdio.h>

int main() {
    int num1, num2, num3;

    // Solicita ao usuário que insira os três números
    printf("Digite três números em ordem aleatória: ");
    scanf("%d %d %d", &num1, &num2, &num3);

    // Encontra o menor número
    int menor = num1;
    if (num2 < menor) {
        menor = num2;
    }
    if (num3 < menor) {
        menor = num3;
    }

    // Encontra o maior número
    int maior = num1;
    if (num2 > maior) {
        maior = num2;
    }
    if (num3 > maior) {
        maior = num3;
    }

    // Calcula o número do meio
    int meio = (num1 + num2 + num3) - (menor + maior);

    // Imprime os números em ordem crescente
    printf("Os números em ordem crescente são: %d, %d, %d\n", menor, meio, maior);

    return 0;
}
