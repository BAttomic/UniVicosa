#include <stdio.h>

int main() {
    
    float percurso, consumo;
    int tipo_carro;
    
    // Solicita ao usuário a distancia do percurso
    printf("Informe a distancia em quilometros do percurso; ");
    scanf("%f", &percurso);
    
    // Checa se é uma distancia válida (positiva)
    if (percurso < 0) {
        printf("\nDistancia invalida!\n");
        getch();
        return 0;
    }
    else {
        // Solicita ao usuário o tipo de carro
        printf("\nInforme o tipo do carro baseado em consumo estimado de combustivel:\n1 - Tipo A - 8km/l\n2 - Tipo B - 9km/l\n3 - Tipo C - 12km/l\nOpcao numerica: ");
        scanf("%d", &tipo_carro);
        
        // Calcula consumo de acordo com a opção de carro
        switch(tipo_carro) {
            case(1):
                consumo=percurso/8;
                break;
            case(2):
                consumo=percurso/9;
                break;
            case(3):
                consumo=percurso/12;
                break;
            // Checa se é uma opção válido (1,2,3)
            default:
                printf("\nOpcao invalida!\n");
                getch();
                return 0;
        }
    }
    
    // Printa o consumo estimado
    printf("O consumo estimado de combustivel durante o percurso e de %.2f litros", consumo);

    getch();
    return 0;
}
