#include<math.h>

int main()
{
    float h, r, c, quantidade, area, litro;
    /*Cria��o das vari�veis Altura, Raio, Custo, Quantidade, Area e Litro respectivamente*/

    printf("Informe a altura: "); /*Input de Altura*/
    scanf("%f",&h); /*Registro de Altura na vari�vel h*/

    printf("Informe o raio: "); /*Input de Raio*/
    scanf("%f",&r); /*Registro de Raio na vari�vel r*/
    
    area=(3.14*pow(r,2))+(2*3.14*r*h); /*C�lculo e Registro de �rea*/
    litro=area/3; /*C�lculo e Registro de Litro*/
    quantidade=litro/5; /*C�lculo e Registro de Quantidade*/
    c=quantidade*50; /*C�lculo e Registro de Custo*/
    
    printf("Quantidade de latas necessarias: %.2f",quantidade); /*Print da Quantidade*/
    printf("\nValor de custo: %.2f",c); /*Print do Custo*/
    
    getch();
    return 0;
}
