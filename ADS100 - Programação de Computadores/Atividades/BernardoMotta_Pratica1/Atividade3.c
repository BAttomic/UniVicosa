#include<math.h>

int main()
{
    float n1, n2, n3, n4, m; /*Cria��o das vari�veis para N�meros e M�dia*/

    printf("Informe quatro numeros pertencente aos reais: "); /*Input dos n�meros*/
    scanf("%f %f %f %f",&n1,&n2,&n3,&n4); /*Registro dos n�meros em suas respectivas vari�veis*/

    m=((n1+n2+n3+n4)/4); /*C�lculo e Registro da M�dia*/
    printf("Media: %.2f",m); /*Print da M�dia*/
    
    getch();
    return 0;
}
