#include <stdio.h>

int main() {
    float valor_compra, valor_venda, lucro;

    // Solicita ao usuário que insira o valor do produto
    printf("Digite o valor do produto: R$ ");
    scanf("%f", &valor_compra);

    // Verifica se o valor da compra é menor que R$ 20,00
    if (valor_compra < 20.0) {
        lucro = valor_compra * 0.45; // Lucro de 45%
    } else {
        lucro = valor_compra * 0.30; // Lucro de 30%
    }

    // Calcula o valor da venda (valor da compra + lucro)
    valor_venda = valor_compra + lucro;

    // Imprime o valor da venda
    printf("O valor de venda do produto é: R$ %.2f\n", valor_venda);

    return 0;
}
