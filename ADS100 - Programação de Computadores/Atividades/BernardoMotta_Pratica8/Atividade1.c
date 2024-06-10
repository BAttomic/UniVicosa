#include <stdio.h>

#define SIZE 10  // define o tamanho do vetor como 10

int main() {
    // definicao do tipo construido vetor
    typedef float Classe[SIZE];

    // declaracao da variavel composta do tipo vetor definido
    Classe VClasse;

    // declaracao das variaveis simples
    float Soma, Media;
    int NotaAcima, X;

    // inicializacao de variaveis
    Soma = 0;
    NotaAcima = 0;

    // laco de leitura de VClasse
    for (X = 0; X < SIZE; X++) {
        printf("Digite o valor para VClasse[%d]: ", X + 1);
        scanf("%f", &VClasse[X]);  // le os valores e armazena no vetor
    }

    // laco para acumular em Soma os valores de VClasse
    for (X = 0; X < SIZE; X++) {
        Soma += VClasse[X];  // acumula os valores em Soma
    }

    Media = Soma / SIZE;  // calculo da media

    // laco para verificar valores de VClasse que estao acima da media
    for (X = 0; X < SIZE; X++) {
        if (VClasse[X] > Media) {  // verifica se o valor e maior que a media
            NotaAcima++;  // incrementa o contador NotaAcima
        }
    }

    printf("\nNumero de valores acima da media: %d\n", NotaAcima);  // exibe o resultado
    
    return 0;
}
