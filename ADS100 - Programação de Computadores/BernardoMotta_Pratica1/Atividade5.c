#include<math.h>

int main()
{
    float n1, n2, n3, n4, n5, mp;
    /*Cria��o das vari�veis para N�meros, N�meros com o Peso Aplicado e M�dia Ponderada*/

    printf("Informe cinco numeros separados por espaco: "); /*Input dos n�meros*/
    scanf("%f %f %f %f %f",&n1 ,&n2 ,&n3 ,&n4 ,&n5); /*Registro dos n�meros em suas respectivas vari�veis*/
    
    n1=(n1*1.5); /*C�lculo e Registro dos N�meros com Pesos Aplicados*/
    n2=(n2*2.5); 
    n3=(n3*3.5);
    n4=(n4*4.5);
    n5=(n5*5.5);
    mp=((n5+n4+n3+n2+n1)/(17.5)); /*C�lculo e Registro da M�dia Ponderada*/
    
    printf("Media ponderada: %.3f",mp); /*Print da M�dia Ponderada*/
    
    getch();
    return 0;
}
