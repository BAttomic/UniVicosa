// Feito por 25398 - Marcos Vinicius Nogueira Martins e 26351 - Bernardo Cordeiro Motta

#include <stdio.h>
#include <conio.h>
#include <stdlib.h>
#include <time.h>

// Definindo constantes para o numero de jogadas e faces do dado
#define TOTAL_JOGADAS 20
#define TOTAL_FACES 6

int main() {
    // Declarando arrays para armazenar os resultados das jogadas e a contagem das frequencias
    int resultados[TOTAL_JOGADAS];
    int contagem[TOTAL_FACES] = {0};

    // Inicializando a semente para a funcao rand() com o tempo atual
    srand(time(NULL));
    
    // Executa as jogadas e conta a frequencia dos resultados
    printf("\nResultados das jogadas:\n");
    for (int i = 0; i < TOTAL_JOGADAS; i++) {
        // Gera um numero aleatorio entre 1 e 6
        resultados[i] = (rand() % TOTAL_FACES) + 1;
        printf("%d ", resultados[i]);
        // Incrementa a contagem do numero sorteado
        contagem[resultados[i] - 1]++;
    }

    // Mostra a frequencia de cada numero de 1 a 6
    printf("\n\nFrequencia dos resultados:\n");
    for (int i = 0; i < TOTAL_FACES; i++) {
        printf("Numero %d: %d vezes\n", i + 1, contagem[i]);
    }
    
    getch();
    return 0;
}
