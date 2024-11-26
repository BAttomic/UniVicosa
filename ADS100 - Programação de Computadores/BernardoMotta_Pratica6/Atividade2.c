#include <stdio.h>

// Fun��o para calcular o valor do aumento com base na tabela fornecida
float calcularAumento(float preco, int categoria) {
    if (preco <= 25) {
        switch (categoria) {
            case 1:
                return preco * 0.05; // 5% de aumento para categoria 1
            case 2:
                return preco * 0.08; // 8% de aumento para categoria 2
            case 3:
                return preco * 0.10; // 10% de aumento para categoria 3
        }
    } else {
        switch (categoria) {
            case 1:
                return preco * 0.12; // 12% de aumento para categoria 1
            case 2:
                return preco * 0.15; // 15% de aumento para categoria 2
            case 3:
                return preco * 0.18; // 18% de aumento para categoria 3
        }
    }
    return 0; // Retorno padr�o, caso algo inesperado ocorra
}

// Fun��o para calcular o valor do imposto com base na categoria e situa��o
float calcularImposto(float preco, int categoria, char situacao) {
    if (categoria == 2 && situacao == 'R') {
        return preco * 0.05; // Imposto de 5% para categoria 2 e situa��o R
    } else {
        return preco * 0.08; // Imposto de 8% para os demais casos
    }
}

// Fun��o para determinar a classifica��o do novo pre�o
char determinarClassificacao(float novoPreco) {
    if (novoPreco <= 50) {
        return 'B'; // Barato
    } else if (novoPreco < 120) {
        return 'N'; // Normal
    } else {
        return 'C'; // Caro
    }
}

int main() {
    float preco, aumento, imposto, novoPreco;
    int categoria;
    char situacao, classificacao;

    printf("Digite o preco do produto: R$ ");
    scanf("%f", &preco);
    printf("Digite a categoria (1 - limpeza, 2 - alimentacao, 3 - vestuario): ");
    scanf("%d", &categoria);
    printf("Digite a situacao (R - refrigeracao, N - nao refrigeracao): ");
    scanf(" %c", &situacao);

    // Calcula o aumento
    aumento = calcularAumento(preco, categoria);
    // Calcula o imposto
    imposto = calcularImposto(preco, categoria, situacao);
    // Calcula o novo pre�o
    novoPreco = preco + aumento + imposto;
    // Determina a classifica��o do novo pre�o
    classificacao = determinarClassificacao(novoPreco);

    // Exibe os resultados
    printf("\nValor do aumento: R$ %.2f\n", aumento);
    printf("Valor do imposto: R$ %.2f\n", imposto);
    printf("Novo preco: R$ %.2f\n", novoPreco);
    printf("Classificacao: ");
    switch (classificacao) {
        case 'B':
            printf("Barato\n");
            break;
        case 'N':
            printf("Normal\n");
            break;
        case 'C':
            printf("Caro\n");
            break;
    }

    return 0;
}
