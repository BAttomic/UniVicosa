#include <stdio.h>
#include <math.h>

int main() {
    float a, b, c;
    float delta, raiz1, raiz2;

    //Solicitar os coeficientes da equa��o do segundo grau
    printf("Digite os coeficientes A, B e C da equacao do segundo grau: ");
    scanf("%f %f %f", &a, &b, &c);

    //Calcular o delta
    delta = b*b - 4*a*c;

    //Verificar se a equa��o tem ra�zes reais
    if (delta < 0) {
        printf("A equacao nao possui raizes pertencentes ao conjunto dos reais.\n");
    } 
    else if (delta == 0) {
        //A equa��o tem uma raiz real
        raiz1 = -b / (2*a);
        printf("A equacao possui uma raiz real: %.2f\n", raiz1);
    } 
    else {
        //A equa��o tem duas ra�zes reais
        raiz1 = (-b + sqrt(delta)) / (2*a);
        raiz2 = (-b - sqrt(delta)) / (2*a);
        printf("As raizes reais da equacao sao: %.2f e %.2f\n", raiz1, raiz2);
    }

    return 0;
}
