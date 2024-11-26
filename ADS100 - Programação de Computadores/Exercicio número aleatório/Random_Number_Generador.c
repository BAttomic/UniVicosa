#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    int numeroAleatorio, chute, tentativas = 0;
    srand(time(0)); // Inicializa o gerador de n�meros aleat�rios

    // Gera um n�mero aleat�rio entre 1 e 100
    numeroAleatorio = rand() % 100 + 1;

    printf("Tente adivinhar o numero entre 1 e 100.\n");

    // Loop para permitir que o usu�rio fa�a m�ltiplos chutes
    do {
        printf("Digite seu chute: ");
        scanf("%d", &chute);
        tentativas++;

        // Verifica se o chute est� abaixo do n�mero
        if (chute < numeroAleatorio) {
            printf("Seu chute esta abaixo do numero.\n");
        }
        // Verifica se o chute est� acima do n�mero
        else if (chute > numeroAleatorio) {
            printf("Seu chute esta acima do numero.\n");
        }
        // Se n�o est� abaixo nem acima, ent�o o chute est� correto
        else {
            printf("Parabens! Voce acertou o numero em %d tentativas!\n", tentativas);
        }
    } while (chute != numeroAleatorio);

    getch();
    return 0;
}
