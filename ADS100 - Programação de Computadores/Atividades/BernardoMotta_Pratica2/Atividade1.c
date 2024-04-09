#include <stdio.h>

int main() {
    int ano, idade; //Cria��o das vari�veis inteiras ano e idade
    
    printf("Informe seu ano de nascimento: "); //Solicita o usu�rio informa��o do seu ano de nascimento
    scanf("%d", &ano); //Salva o ano de nascimento na vari�vel ano
    idade = 2024 - ano; //Opera a idade estimada do usu�rio
    
    
    if (idade >= 18) { //Condicional, se voc� tem 18 anos ou mais, voc� pode tirar carteira de habilita��o!
        printf("Voce pode tirar carteira de habilitacao!\n");
    } 
    
    else if (idade >= 16) { //Condicional, se voc� tem 16 anos ou mais, voc� pode votar!
        printf("Voce pode votar!\n");
    } 
    
    else { //Condicional restante, se voc� n�o tem 16 anos ou mais, voc� n�o pode votar nem tirar habilita��o!
        printf("Voce ainda nao pode votar ou tirar carteira de habilitacao.\n");
    }
    
    getch();
    return 0;
}
