#include <stdio.h>

int main() {
    float a, b, c;

    // Solicitar os valores dos lados do tri�ngulo
    printf("Digite os valores dos lados do triangulo (separados por espaco): ");
    scanf("%f %f %f", &a, &b, &c);

    // Verificar se os valores fornecidos formam um tri�ngulo
    if (a < b + c && b < a + c && c < a + b) {
        // Verificar se � equil�tero, is�sceles ou escaleno
        if (a == b && b == c) {
            printf("Os lados formam um triangulo equilatero.\n");
        } 
        else if (a == b || a == c || b == c) {
            printf("Os lados formam um triangulo isosceles.\n");
        } 
        else {
            printf("Os lados formam um triangulo escaleno.\n");
        }
    } 
    else {
        printf("Os valores fornecidos nao formam um triangulo.\n");
    }

    getch();
    return 0;
}
