#include <stdio.h>
#include <conio.h>

int main() {
    float precoFabrica, percentLucro, percentImpostos;
    float lucro, impostos, precoFinal;

    // Solicita ao usuario que insira os valores
    printf("Insira o preco de fabrica do veiculo: ");
    scanf("%f", &precoFabrica);
    printf("Insira o percentual de lucro do distribuidor: ");
    scanf("%f", &percentLucro);
    printf("Insira o percentual de impostos: ");
    scanf("%f", &percentImpostos);

    // Calcula o lucro do distribuidor e os impostos
    lucro = precoFabrica * (percentLucro / 100);
    impostos = precoFabrica * (percentImpostos / 100);

    // Calcula o preco final do veiculo
    precoFinal = precoFabrica + lucro + impostos;

    // Exibe os resultados
    printf("Valor correspondente ao lucro do distribuidor: R$ %.2f\n", lucro);
    printf("Valor correspondente aos impostos: R$ %.2f\n", impostos);
    printf("Preco final do veiculo: R$ %.2f\n", precoFinal);

    getch();
    return 0;
}
