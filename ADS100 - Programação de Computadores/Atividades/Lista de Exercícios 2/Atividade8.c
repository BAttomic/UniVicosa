#include <stdio.h>

int main() {
    int codigo_produto;

    // Solicita ao usuário que insira o código do produto
    printf("Digite o código do produto: ");
    scanf("%d", &codigo_produto);

    // Utiliza a estrutura if-else para classificar o produto
    if (codigo_produto == 1) {
        printf("Alimento não perecível\n");
    } else if (codigo_produto >= 2 && codigo_produto <= 4) {
        printf("Alimento perecível\n");
    } else if (codigo_produto >= 5 && codigo_produto <= 6) {
        printf("Vestuário\n");
    } else if (codigo_produto == 7) {
        printf("Higiene pessoal\n");
    } else if (codigo_produto >= 8 && codigo_produto <= 15) {
        printf("Limpeza e utensílios domésticos\n");
    } else {
        printf("Código de produto inválido\n");
    }

    return 0;
}
