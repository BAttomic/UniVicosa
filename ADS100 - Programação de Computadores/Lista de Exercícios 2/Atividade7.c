#include <stdio.h>

int main() {
    int codigo_produto;

    // Solicita ao usu�rio que insira o c�digo do produto
    printf("Digite o c�digo do produto: ");
    scanf("%d", &codigo_produto);

    // Utiliza a estrutura switch case para classificar o produto
    switch (codigo_produto) {
        case 1:
            printf("Alimento n�o perec�vel\n");
            break;
        case 2:
        case 3:
        case 4:
            printf("Alimento perec�vel\n");
            break;
        case 5:
        case 6:
            printf("Vestu�rio\n");
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
            printf("Limpeza e utens�lios dom�sticos\n");
            break;
        default:
            printf("C�digo de produto inv�lido\n");
    }

    return 0;
}
