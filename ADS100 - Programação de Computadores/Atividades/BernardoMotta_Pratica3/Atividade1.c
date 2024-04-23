#include <locale.h>
#include <stdio.h>
#include <math.h>

int main() {
    int menu;
    printf("Escolha a operação abaixo que deseja: \n1 - Adicao; A+B\n2 - Subtracao; A-B\n3 - Divisao; A/B\n4 - Multiplicacao; A*B\n5 - Potencializacao; A^B\n6 - Radicializacao; A^(1/B)\nOperacao desejada: ");
    scanf("%d", &menu);
    
    float a, b;
    printf("Escreva numeros para as variaveis A e B respectivamente: ");
    scanf("%f %f", &a, &b);
    
    switch (menu) {
        case 1:
            printf("%.2f + %.2f = %.2f\n", a, b, (a + b));
            break;

        case 2:
            printf("%.2f - %.2f = %.2f\n", a, b, (a - b));
            break;

        case 3:
            if (b != 0)
                printf("%.2f / %.2f = %.2f\n", a, b, (a / b));
            else
                printf("Erro! Divisao por zero nao e permitida.\n");
            break;

        case 4:
            printf("%.2f * %.2f = %.2f\n", a, b, (a * b));
            break;

        case 5:
            printf("%.2f ^ %.2f = %.2f\n", a, b, (pow(a, b)));
            break;

        case 6:
            if (b != 0)
                printf("%.2f ^ (1 / %.2f) = %.2f\n", a, b, (pow(a, 1 / b)));
            else
                printf("Erro! Nao e possivel calcular a raiz de um numero com expoente zero.\n");
            break;

        default:
            printf("Operacao invalida!\n");
            break;
    }

    getch();
    return 0;
}
