#include <stdio.h>
#include <stdlib.h>

int main() {
    float base, altura, area;

    do {
        printf("Digite a base do triangulo: ");
        scanf("%f", &base);
        printf("Digite a altura do triangulo: ");
        scanf("%f", &altura);
        if (base <= 0 || altura <= 0) {
            printf("Medidas devem ser maiores que zero.\n");
        }
    } while (base <= 0 || altura <= 0);

    area = (base * altura) / 2;
    printf("A area do triangulo e: %.2f\n", area);
    system("pause");
    return 0;
}
