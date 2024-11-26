#include <stdio.h>

int main() {
    
    int codigo_produto, quantidade;
    float preco_unitario, preco_total, desconto, preco_final;
    
    // Solicita ao usuario que insira o c�digo do produto e a quantidade comprada
    printf("Digite o codigo do produto (1 a 40): ");
    scanf("%d", &codigo_produto);
    printf("Digite a quantidade comprada: ");
    scanf("%d", &quantidade);
    
    // Calcula o pre�o unitario do produto de acordo com a tabela
    if (codigo_produto >= 1 && codigo_produto <= 10) {
       preco_unitario = 10;
    }
    else if (codigo_produto >= 11 && codigo_produto <= 20) {
         preco_unitario = 15;
    }
    else if (codigo_produto >= 21 && codigo_produto <= 30) {
         preco_unitario = 20;
    }
    else if (codigo_produto >= 31 && codigo_produto <= 40) {
         preco_unitario = 30;
    }
    else {
         printf("\nCodigo de produto invalido.\n");
         
         getch();
         return 0;
    }
    
    // Calcula o pre�o total da nota
    preco_total = preco_unitario * quantidade;
    
    // Calcula o desconto de acordo com o pre�o total da nota
    if (preco_total <= 250) {
       desconto = preco_total * 0.05; // 5%
    }
    else if (preco_total > 250 && preco_total <= 500) {
         desconto = preco_total * 0.10; // 10%
    }
    else {
         desconto = preco_total * 0.15; // 15%
    }
    
    // Calcula o pre�o final da nota depois do desconto
    preco_final = preco_total - desconto;
    
    // Exibe os resultados
    printf("\nPreco unitario do produto: R$ %.2f\n", preco_unitario);
    printf("Preco total da nota: R$ %.2f\n", preco_total);
    printf("Desconto aplicado: R$ %.2f\n", desconto);
    printf("Preco final da nota: R$ %.2f\n", preco_final);
    
    getch();
    return 0;
}
