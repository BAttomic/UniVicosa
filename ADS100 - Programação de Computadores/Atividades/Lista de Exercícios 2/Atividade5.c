#include <stdio.h>

int main() {
    int ladoA, ladoB, ladoC;
    
    // Leitura dos lados do tri�ngulo
    printf("Digite o valor do lado A: ");
    scanf("%d", &ladoA);
    
    printf("Digite o valor do lado B: ");
    scanf("%d", &ladoB);
    
    printf("Digite o valor do lado C: ");
    scanf("%d", &ladoC);
    
    // Verifica��o da validade dos lados
    if ((ladoA < ladoB + ladoC) && (ladoB < ladoA + ladoC) && (ladoC < ladoA + ladoB)) {
        
        // Verifica��o do tipo de tri�ngulo
        if ((ladoA == ladoB) && (ladoB == ladoC)) {
            printf("Tri�ngulo Equil�tero\n");
        } else if ((ladoA == ladoB) || (ladoA == ladoC) || (ladoB == ladoC)) {
            printf("Tri�ngulo Is�sceles\n");
        } else {
            printf("Tri�ngulo Escaleno\n");
        }
        
    } else {
        printf("Estes valores n�o formam um tri�ngulo!\n");
    }
    
    return 0;
}
