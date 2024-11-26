#include <stdio.h>

int main() {
    int i = 0; // Inicializa a variável de controle
    
    // Loop enquanto i for menor ou igual a 100
    while (i <= 100) {
        printf("%d\n", i);
        i++; // Incrementa i para avançar para o próximo número
    }
    
    getch();
    return 0;
}
