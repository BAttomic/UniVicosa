#include<stdio.h>
#include<conio.h>

int main()
{
    float aux, peso, altura, estimativa;
    aux = 1;
    do {
        aux += 1;
        printf("\nInforme peso atual (em kilogramas): ");
        scanf("%f", &peso);
        printf("\nInforme altura atual (em metros): ");
        scanf("%f", &altura);

        if (peso <= 0 || altura <= 0) {
            printf("\nPeso ou altura invalidos. Ambos devem ser positivos.\n");
        } else {
            estimativa = peso/(altura * altura);

            if (estimativa < 20) {
                printf("\nAbaixo do peso");
            } else if (estimativa <= 25) {
                printf("\nPeso ideal");
            } else {
                printf("\nAcima do peso");
            }
        }
    } while (aux <= 25);
    
    getch();
    return 0;
}
