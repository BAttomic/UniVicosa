#include <locale.h>
#include <stdio.h>
#include <math.h>

int main() {
    int menu;
    printf("Menu de opcoes:\n1 - Imposto\n2 - Novo Salario\n3 - Classificacao\nOpcao Desejada: ");
    scanf("%d", &menu);

    float salario,imposto;

    switch (menu) {
           case 1:
                printf("\nPara calcular o Imposto, informe seu salario: R$");
                scanf("%f", &salario);

                if (salario<500) {
                    imposto=salario*0.05;
                    printf("\nSalario: R$%.2f\nValor Imposto: %.2f (5 porcento)\nValor a Receber: R$%.2f", salario,(imposto),(salario-imposto));
                    }
                else if (salario>=500 && salario<=850) {
                    imposto=salario*0.10;
                    printf("\nSalario: R$%.2f\nValor Imposto: %.2f (10 porcento)\nValor a Receber: R$%.2f", salario,(imposto),(salario-imposto));
                    }
                else if (salario>850) {
                    imposto=salario*0.15;
                    printf("\nSalario: R$%.2f\nValor Imposto: %.2f (15 porcento)\nValor a Receber: R$%.2f", salario,(imposto),(salario-imposto));
                    }
                else {
                     printf("Valor invalido!");
                     }
                break;

           case 2:
                printf("\nPara calcular o Novo Salario, informe seu salario: R$");
                scanf("%f", &salario);

                if (salario>1500) {
                    printf("\nSalario: R$%.2f\nAumento: R$25.00\nValor a Receber: R$%.2f", salario,(salario+25));
                    }
                else if (salario<=1500 && salario>=750) {
                    printf("\nSalario: R$%.2f\nAumento: R$50.00\nValor a Receber: R$%.2f", salario,(salario+50));
                    }
                else if (salario<750 && salario>=450) {
                    printf("\nSalario: R$%.2f\nAumento: R$75.00\nValor a Receber: R$%.2f", salario,(salario+75));
                    }
                else if (salario<450) {
                    printf("\nSalario: R$%.2f\nAumento: R$100.00\nValor a Receber: R$%.2f", salario,(salario+100));
                    }
                else {
                     printf("Valor invalido!");
                     }
                break;

           case 3:
                printf("\nPara calcular o Novo Salario, informe seu salario: R$");
                scanf("%f", &salario);
                
                if (salario<=700) {
                    printf("\nClassificacao: Mal Remunerado");
                    }
                else if (salario>700) {
                    printf("\nClassificacao: Bem Remunerado");
                    }
                else {
                    printf("\nValor invalido!");
                    }
                break;

            default:
                printf("Operacao invalida!\n");
                break;
           }

    getch();
    return 0;
}
