#include<math.h>

int main()
{
    float n1, n2, n3, n4, m; /*Criação das variáveis para Números e Média*/

    printf("Informe quatro numeros pertencente aos reais: "); /*Input dos números*/
    scanf("%f %f %f %f",&n1,&n2,&n3,&n4); /*Registro dos números em suas respectivas variáveis*/

    m=((n1+n2+n3+n4)/4); /*Cálculo e Registro da Média*/
    printf("Media: %.2f",m); /*Print da Média*/
    
    getch();
    return 0;
}
