#include <stdio.h>

int main() {
    int ano, idade; //Cria��o das vari�veis inteiras ano e idade
    
    printf("Informe seu ano de nascimento: "); //Solicita o usu�rio informa��o do seu ano de nascimento
    scanf("%d", &ano); //Salva o ano de nascimento na vari�vel ano
    idade = 2024 - ano; //Opera a idade estimada do usu�rio
    
    if (idade >= 16 && idade >= 18) {
        printf("Voce pode votar e tirar carteira de habilitacao!\n");
    } 

    else if (idade >= 16) {
        printf("Voce pode votar!\n");
    } 

    else {
        printf("Voce ainda nao pode votar ou tirar carteira de habilitacao.\n");
    }

    getch();
    return 0;
}
