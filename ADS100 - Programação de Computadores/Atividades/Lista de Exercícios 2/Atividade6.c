#include <stdio.h>

int main() {
    int codigo_produto, quantidade;
    float preco_unitario, preco_total, desconto, preco_final;

    // Solicita ao usu�rio que insira o c�digo do produto e a quantidade comprada
    printf("Digite o c�digo do produto (1 a 40): ");
    scanf("%d", &codigo_produto);

    printf("Digite a quantidade comprada: ");
    scanf("%d", &quantidade);

    // Calcula o pre�o unit�rio do produto de acordo com a tabela
    if (codigo_produto >= 1 && codigo_produto <= 10) {
        preco_unitario = 10;
    } else if (codigo_produto >= 11 && codigo_produto <= 20) {
        preco_unitario = 15;
    } else if (codigo_produto >= 21 && codigo_produto <= 30) {
        preco_unitario = 20;
    } else if (codigo_produto >= 31 && codigo_produto <= 40) {
        preco_unitario = 30;
    } else {
        printf("C�digo de produto inv�lido.\n");
        return 1;
    }

    // Calcula o pre�o total da nota
    preco_total = preco_unitario * quantidade;

    // Calcula o desconto de acordo com o pre�o total da nota
    if (preco_total <= 250) {
        desconto = preco_total * 0.05; // 5%
    } else if (preco_total > 250 && preco_total <= 500) {
        desconto = preco_total * 0.10; // 10%
    } else {
        desconto = preco_total * 0.15; // 15%
    }

    // Calcula o pre�o final da nota depois do desconto
    preco_final = preco_total - desconto;

    // Exibe os resultados
    printf("Pre�o unit�rio do produto: R$ %.2f\n", preco_unitario);
    printf("Pre�o total da nota: R$ %.2f\n", preco_total);
    printf("Desconto aplicado: R$ %.2f\n", desconto);
    printf("Pre�o final da nota: R$ %.2f\n", preco_final);

    return 0;
}
