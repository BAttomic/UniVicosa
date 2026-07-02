#include <stdio.h>
#include <conio.h>

int main() {
    float altura, base, area;

    // Solicitar altura e base do usuário
    printf("Digite a altura do triangulo: ");
    scanf("%f", &altura);

    printf("Digite a base do triangulo: ");
    scanf("%f", &base);

    // Calcular a área do triângulo
    area = (base * altura) / 2;

    // Exibir a área calculada
    printf("A area do triangulo e: %.2f\n", area);

    getch();
    return 0;
}
