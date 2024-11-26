#include <stdio.h>
#include <stdlib.h>

int main() {
    int numero_pedido;
    float preco_unitario, quantidade, valor_total = 0;

    do {
        printf("Digite o numero do pedido (0 para sair): ");
        scanf("%d", &numero_pedido);
        if (numero_pedido != 0) {
            printf("Digite o preco unitario: ");
            scanf("%f", &preco_unitario);
            printf("Digite a quantidade: ");
            scanf("%f", &quantidade);
            valor_total += preco_unitario * quantidade;
        }
    } while (numero_pedido != 0);

    printf("O valor total da compra e: %.2f\n", valor_total);
    system("pause");
    return 0;
}
