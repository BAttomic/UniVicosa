#include <stdio.h>

int main() {
    float salario_bruto, valor_prestacao, limite_prestacao;

    // Solicita ao usuário que insira o salário bruto e o valor da prestação
    printf("Digite o salário bruto: ");
    scanf("%f", &salario_bruto);

    printf("Digite o valor da prestação: ");
    scanf("%f", &valor_prestacao);

    // Calcula o limite da prestação (30% do salário bruto)
    limite_prestacao = salario_bruto * 0.30;

    // Verifica se o valor da prestação é menor ou igual ao limite permitido
    if (valor_prestacao <= limite_prestacao) {
        printf("Empréstimo pode ser concedido.\n");
    } else {
        printf("Empréstimo não pode ser concedido. Valor da prestação excede 30%% do salário bruto.\n");
    }

    return 0;
}
