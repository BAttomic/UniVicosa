#include <stdio.h>

int main() {
    int codigo_produto;

    // Solicita ao usu�rio que insira o c�digo do produto
    printf("Digite o c�digo do produto: ");
    scanf("%d", &codigo_produto);

    // Utiliza a estrutura if-else para classificar o produto
    if (codigo_produto == 1) {
        printf("Alimento n�o perec�vel\n");
    } else if (codigo_produto >= 2 && codigo_produto <= 4) {
        printf("Alimento perec�vel\n");
    } else if (codigo_produto >= 5 && codigo_produto <= 6) {
        printf("Vestu�rio\n");
    } else if (codigo_produto == 7) {
        printf("Higiene pessoal\n");
    } else if (codigo_produto >= 8 && codigo_produto <= 15) {
        printf("Limpeza e utens�lios dom�sticos\n");
    } else {
        printf("C�digo de produto inv�lido\n");
    }

    return 0;
}
