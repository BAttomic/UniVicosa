#include <stdio.h>

int main() {
    int ano, idade; //Criação das variáveis inteiras ano e idade
    
    printf("Informe seu ano de nascimento: "); //Solicita o usuário informação do seu ano de nascimento
    scanf("%d", &ano); //Salva o ano de nascimento na variável ano
    idade = 2024 - ano; //Opera a idade estimada do usuário
    
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
