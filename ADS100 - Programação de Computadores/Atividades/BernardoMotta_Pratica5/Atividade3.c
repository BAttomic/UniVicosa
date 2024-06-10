#include <stdio.h>
#include <stdlib.h>

#define NUM_CARGAS 10

int main() {
    float potencias[NUM_CARGAS], distancias[NUM_CARGAS];
    float rho = 1.0 / 58.0, e_percent = 0.02, U = 127.0;
    float Sc = 0;
    int i;

    for (i = 0; i < NUM_CARGAS; i++) {
        printf("Digite a potencia %d (em Watt): ", i + 1);
        scanf("%f", &potencias[i]);
        printf("Digite a distancia %d (em metros): ", i + 1);
        scanf("%f", &distancias[i]);
    }

    for (i = 0; i < NUM_CARGAS; i++) {
        Sc += potencias[i] * distancias[i];
    }

    Sc = (2 * rho * Sc) / (e_percent * U * U);

    printf("A secao do condutor de cobre e: %.2f mm2\n", Sc);
    system("pause");
    return 0;
}
