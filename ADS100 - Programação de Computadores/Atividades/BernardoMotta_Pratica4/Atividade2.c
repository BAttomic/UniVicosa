#include <stdio.h>

int main() {
    int i = 0; // Inicializa a vari�vel de controle
    
    // Loop enquanto i for menor ou igual a 100
    while (i <= 100) {
        printf("%d\n", i);
        i++; // Incrementa i para avan�ar para o pr�ximo n�mero
    }
    
    getch();
    return 0;
}
