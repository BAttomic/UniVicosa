#include <stdio.h>

int main() {
    int codigo_produto;

    // Solicita ao usuário que insira o código do produto
    printf("Digite o código do produto: ");
    scanf("%d", &codigo_produto);

    // Utiliza a estrutura switch case para classificar o produto
    switch (codigo_produto) {
        case 1:
            printf("Alimento não perecível\n");
            break;
        case 2:
        case 3:
        case 4:
            printf("Alimento perecível\n");
            break;
        case 5:
        case 6:
            printf("Vestuário\n");
            break;
        case 7:
            printf("Higiene pessoal\n");
            break;
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
            printf("Limpeza e utensílios domésticos\n");
            break;
        default:
            printf("Código de produto inválido\n");
    }

    return 0;
}
