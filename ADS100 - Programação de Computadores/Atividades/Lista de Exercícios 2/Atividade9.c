#include <stdio.h>

int main() {
    int num1, num2, num3;

    // Solicita ao usu�rio que insira os tr�s n�meros
    printf("Digite tr�s n�meros em ordem aleat�ria: ");
    scanf("%d %d %d", &num1, &num2, &num3);

    // Encontra o menor n�mero
    int menor = num1;
    if (num2 < menor) {
        menor = num2;
    }
    if (num3 < menor) {
        menor = num3;
    }

    // Encontra o maior n�mero
    int maior = num1;
    if (num2 > maior) {
        maior = num2;
    }
    if (num3 > maior) {
        maior = num3;
    }

    // Calcula o n�mero do meio
    int meio = (num1 + num2 + num3) - (menor + maior);

    // Imprime os n�meros em ordem crescente
    printf("Os n�meros em ordem crescente s�o: %d, %d, %d\n", menor, meio, maior);

    return 0;
}
