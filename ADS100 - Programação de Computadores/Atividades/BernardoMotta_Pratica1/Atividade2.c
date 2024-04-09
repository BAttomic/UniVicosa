#include<math.h>

int main()
{
    float h, r, c, quantidade, area, litro;
    /*Criação das variáveis Altura, Raio, Custo, Quantidade, Area e Litro respectivamente*/

    printf("Informe a altura: "); /*Input de Altura*/
    scanf("%f",&h); /*Registro de Altura na variável h*/

    printf("Informe o raio: "); /*Input de Raio*/
    scanf("%f",&r); /*Registro de Raio na variável r*/
    
    area=(3.14*pow(r,2))+(2*3.14*r*h); /*Cálculo e Registro de Área*/
    litro=area/3; /*Cálculo e Registro de Litro*/
    quantidade=litro/5; /*Cálculo e Registro de Quantidade*/
    c=quantidade*50; /*Cálculo e Registro de Custo*/
    
    printf("Quantidade de latas necessarias: %.2f",quantidade); /*Print da Quantidade*/
    printf("\nValor de custo: %.2f",c); /*Print do Custo*/
    
    getch();
    return 0;
}
