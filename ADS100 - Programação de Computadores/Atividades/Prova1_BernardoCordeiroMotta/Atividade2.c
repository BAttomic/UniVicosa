#include <stdio.h>
#include <conio.h>

int main() {
    float altura, base, area;

    // Solicitar altura e base do usu�rio
    printf("Digite a altura do triangulo: ");
    scanf("%f", &altura);

    printf("Digite a base do triangulo: ");
    scanf("%f", &base);

    // Calcular a �rea do tri�ngulo
    area = (base * altura) / 2;

    // Exibir a �rea calculada
    printf("A area do triangulo e: %.2f\n", area);

    getch();
    return 0;
}
