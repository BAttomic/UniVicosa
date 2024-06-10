#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    int numeroAleatorio, chute, tentativas = 0;
    srand(time(0)); // Inicializa o gerador de números aleatórios

    // Gera um número aleatório entre 1 e 100
    numeroAleatorio = rand() % 100 + 1;

    printf("Tente adivinhar o numero entre 1 e 100.\n");

    // Loop para permitir que o usuário faça múltiplos chutes
    do {
        printf("Digite seu chute: ");
        scanf("%d", &chute);
        tentativas++;

        // Verifica se o chute está abaixo do número
        if (chute < numeroAleatorio) {
            printf("Seu chute esta abaixo do numero.\n");
        }
        // Verifica se o chute está acima do número
        else if (chute > numeroAleatorio) {
            printf("Seu chute esta acima do numero.\n");
        }
        // Se não está abaixo nem acima, então o chute está correto
        else {
            printf("Parabens! Voce acertou o numero em %d tentativas!\n", tentativas);
        }
    } while (chute != numeroAleatorio);

    getch();
    return 0;
}
