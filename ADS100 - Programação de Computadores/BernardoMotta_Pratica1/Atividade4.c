#include<math.h>

int main()
{
    int n1, n2, n3, r; /*Criação das variáveis para Números e Resto*/

    printf("Informe tres numeros inteiros separados por espaco: "); /*Input dos números*/
    scanf("%d %d %d",&n1,&n2,&n3); /*Registro dos números em suas respectivas variáveis*/

    r=((n1*n2*n3)%2); /*Cálculo e Registro do Resto*/
    printf("Resto da divisao por dois: %d",r); /*Print da Resto*/
    
    getch();
    return 0;
}
