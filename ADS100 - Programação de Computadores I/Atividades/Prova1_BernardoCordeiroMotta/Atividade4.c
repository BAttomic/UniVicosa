#include <stdio.h>
#include <conio.h>

int main() {
    float h_trab, salario, h_extra, hTrabTotal, hExTotal, salario_bruto;

    // Leia o salário, horas trabalhadas e horas extras
    printf("Digite o salario: ");
    scanf("%f", &salario);

    printf("Digite as horas trabalhadas e horas extras: ");
    scanf("%f %f", &h_trab, &h_extra);

    // Calcule o total das horas trabalhadas e horas extras
    hTrabTotal = salario * h_trab * 1 / 8;
    hExTotal = salario * h_extra * 1 / 4;

    // Calcule o salário bruto
    salario_bruto = hTrabTotal + hExTotal;

    // Escreva o total de horas extras, total de horas trabalhadas e o salário bruto
    printf("Total de horas extras: %.2f\n", hExTotal);
    printf("Total de horas trabalhadas: %.2f\n", hTrabTotal);
    printf("Salario bruto: %.2f\n", salario_bruto);

    getch();
    return 0;
}
