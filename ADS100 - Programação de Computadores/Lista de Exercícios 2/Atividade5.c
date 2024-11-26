#include <stdio.h>

int main() {
    int ladoA, ladoB, ladoC;
    
    // Leitura dos lados do triângulo
    printf("Digite o valor do lado A: ");
    scanf("%d", &ladoA);
    
    printf("Digite o valor do lado B: ");
    scanf("%d", &ladoB);
    
    printf("Digite o valor do lado C: ");
    scanf("%d", &ladoC);
    
    // Verificação da validade dos lados
    if ((ladoA < ladoB + ladoC) && (ladoB < ladoA + ladoC) && (ladoC < ladoA + ladoB)) {
        
        // Verificação do tipo de triângulo
        if ((ladoA == ladoB) && (ladoB == ladoC)) {
            printf("Triângulo Equilátero\n");
        } else if ((ladoA == ladoB) || (ladoA == ladoC) || (ladoB == ladoC)) {
            printf("Triângulo Isósceles\n");
        } else {
            printf("Triângulo Escaleno\n");
        }
        
    } else {
        printf("Estes valores não formam um triângulo!\n");
    }
    
    return 0;
}
