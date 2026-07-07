#include <stdio.h>

// Definindo o tamanho do tabuleiro
#define TAMANHO 3

// Funcao para imprimir o tabuleiro do jogo
void mostrarTabuleiro(char tabuleiro[TAMANHO][TAMANHO]) {
    int linha, coluna;
    printf("\n  0 1 2\n");  // Cabecalho das colunas
    for (linha = 0; linha < TAMANHO; linha++) {
        printf("%d ", linha);  // Indice da linha
        for (coluna = 0; coluna < TAMANHO; coluna++) {
            printf("%c", tabuleiro[linha][coluna]);
            if (coluna < TAMANHO - 1) printf("|");  // Separador de colunas
        }
        printf("\n");
        if (linha < TAMANHO - 1) printf("  -----\n");  // Separador de linhas
    }
    printf("\n");
}

// Funcao para verificar se um jogador venceu
int checarVencedor(char tabuleiro[TAMANHO][TAMANHO], char jogador) {
    int linha;
    // Verificar linhas e colunas
    for (linha = 0; linha < TAMANHO; linha++) {
        if (tabuleiro[linha][0] == jogador && tabuleiro[linha][1] == jogador && tabuleiro[linha][2] == jogador) return 1;
        if (tabuleiro[0][linha] == jogador && tabuleiro[1][linha] == jogador && tabuleiro[2][linha] == jogador) return 1;
    }
    // Verificar diagonais
    if (tabuleiro[0][0] == jogador && tabuleiro[1][1] == jogador && tabuleiro[2][2] == jogador) return 1;
    if (tabuleiro[0][2] == jogador && tabuleiro[1][1] == jogador && tabuleiro[2][0] == jogador) return 1;
    return 0;
}

int main() {
    // Inicializar o tabuleiro vazio
    char tabuleiro[TAMANHO][TAMANHO] = { {' ', ' ', ' '}, {' ', ' ', ' '}, {' ', ' ', ' '} };
    char jogadorAtual = 'X';  // Jogador inicial
    int linha, coluna;
    int jogadas = 0;  // Contador de jogadas
    
    while (1) {
        mostrarTabuleiro(tabuleiro);  // Mostrar o estado atual do tabuleiro
        printf("Jogador %c, insira sua jogada (linha e coluna): ", jogadorAtual);
        scanf("%d %d", &linha, &coluna);

        // Verificar se a jogada e valida
        if (linha < 0 || linha >= TAMANHO || coluna < 0 || coluna >= TAMANHO || tabuleiro[linha][coluna] != ' ') {
            printf("Jogada invalida. Tente novamente.\n\n");
            continue;
        }

        // Registrar a jogada
        tabuleiro[linha][coluna] = jogadorAtual;
        jogadas++;

        // Verificar se o jogador atual venceu
        if (checarVencedor(tabuleiro, jogadorAtual)) {
            mostrarTabuleiro(tabuleiro);
            printf("Jogador %c vence!\n", jogadorAtual);
            break;
        }

        // Verificar se todas as jogadas foram feitas (empate)
        if (jogadas == TAMANHO * TAMANHO) {
            mostrarTabuleiro(tabuleiro);
            printf("Empate!\n");
            break;
        }

        // Alternar para o proximo jogador
        jogadorAtual = (jogadorAtual == 'X') ? 'O' : 'X';
    }

    return 0;
}
