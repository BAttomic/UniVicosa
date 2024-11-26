#include <stdio.h>
#include <math.h>

int main() {
    double num1, num2, resultado;
    char operacao;
    int i = 0;

    while (i < 10) {
        puts("Escolha a operacao desejada:");
        puts("a) Adicao");
        puts("s) Subtracao");
        puts("m) Multiplicacao");
        puts("d) Divisao");
        puts("p) Potenciacao");
        puts("r) Radiciacao");
        puts("x) Encerrar operacao");
        
        scanf(" %c", &operacao);

        if (operacao == 'x') {
            printf("Operacao encerrada.\n");
            break;
        }

        printf("Digite o primeiro numero: ");
        scanf("%lf", &num1);
        printf("Digite o segundo numero: ");
        scanf("%lf", &num2);

        switch (operacao) {
            case 'a':
                resultado = num1 + num2;
                printf("Resultado: %.2lf\n", resultado);
                break;
            case 's':
                resultado = num1 - num2;
                printf("Resultado: %.2lf\n", resultado);
                break;
            case 'm':
                resultado = num1 * num2;
                printf("Resultado: %.2lf\n", resultado);
                break;
            case 'd':
                if (num2 != 0) {
                    resultado = num1 / num2;
                    printf("Resultado: %.2lf\n", resultado);
                } else {
                    printf("Erro: Divisao por zero!\n");
                }
                break;
            case 'p':
                resultado = pow(num1, num2);
                printf("Resultado: %.2lf\n", resultado);
                break;
            case 'r':
                if (num2 >= 0) {
                    resultado = pow(num1, 1.0 / num2);
                    printf("Resultado: %.2lf\n", resultado);
                } else {
                    printf("Erro: Raiz de numero negativo!\n");
                }
                break;
            default:
                printf("Opcao invalida!\n");
        }
        
        i++;
    }

    return 0;
}
