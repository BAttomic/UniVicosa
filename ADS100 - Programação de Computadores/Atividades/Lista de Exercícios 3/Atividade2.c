#include <stdio.h>

#define DIARIA_BASE 30
#define TAXA_SERVICO1 15
#define TAXA_SERVICO2 8

int main() {
    int num_dias;
    int num_conta;
    float total_ganho = 0;

    printf("Entre com o numero da conta e o numero de dias de estadia (0 para encerrar):\n");

    while (1) {
        scanf("%d", &num_conta);
        if (num_conta == 0)
            break;

        scanf("%d", &num_dias);

        // Calculando o valor da diária baseado no número de dias
        float valor_diaria = DIARIA_BASE + (num_dias < 10 ? TAXA_SERVICO1 : TAXA_SERVICO2);
        total_ganho += valor_diaria * num_dias; // Atualizando o total ganho pela pousada

        printf("Conta: %d - Total a pagar: R$%.2f\n", num_conta, valor_diaria * num_dias);
    }

    printf("Total ganho pela pousada: R$%.2f\n", total_ganho);

    return 0;
}
