#include<math.h>

int main()
{
    int n1, n2, n3, r; /*Cria��o das vari�veis para N�meros e Resto*/

    printf("Informe tres numeros inteiros separados por espaco: "); /*Input dos n�meros*/
    scanf("%d %d %d",&n1,&n2,&n3); /*Registro dos n�meros em suas respectivas vari�veis*/

    r=((n1*n2*n3)%2); /*C�lculo e Registro do Resto*/
    printf("Resto da divisao por dois: %d",r); /*Print da Resto*/
    
    getch();
    return 0;
}
