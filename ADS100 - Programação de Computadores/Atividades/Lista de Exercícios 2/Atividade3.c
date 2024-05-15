#include <stdio.h>

int main() {
    float salario_bruto, valor_prestacao, limite_prestacao;

    // Solicita ao usu�rio que insira o sal�rio bruto e o valor da presta��o
    printf("Digite o sal�rio bruto: ");
    scanf("%f", &salario_bruto);

    printf("Digite o valor da presta��o: ");
    scanf("%f", &valor_prestacao);

    // Calcula o limite da presta��o (30% do sal�rio bruto)
    limite_prestacao = salario_bruto * 0.30;

    // Verifica se o valor da presta��o � menor ou igual ao limite permitido
    if (valor_prestacao <= limite_prestacao) {
        printf("Empr�stimo pode ser concedido.\n");
    } else {
        printf("Empr�stimo n�o pode ser concedido. Valor da presta��o excede 30%% do sal�rio bruto.\n");
    }

    return 0;
}
