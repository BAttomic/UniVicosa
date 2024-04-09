#include<math.h>

int main()
{
    float n1, n2, n3, n4, n5, mp;
    /*Criação das variáveis para Números, Números com o Peso Aplicado e Média Ponderada*/

    printf("Informe cinco numeros separados por espaco: "); /*Input dos números*/
    scanf("%f %f %f %f %f",&n1 ,&n2 ,&n3 ,&n4 ,&n5); /*Registro dos números em suas respectivas variáveis*/
    
    n1=(n1*1.5); /*Cálculo e Registro dos Números com Pesos Aplicados*/
    n2=(n2*2.5); 
    n3=(n3*3.5);
    n4=(n4*4.5);
    n5=(n5*5.5);
    mp=((n5+n4+n3+n2+n1)/(17.5)); /*Cálculo e Registro da Média Ponderada*/
    
    printf("Media ponderada: %.3f",mp); /*Print da Média Ponderada*/
    
    getch();
    return 0;
}
