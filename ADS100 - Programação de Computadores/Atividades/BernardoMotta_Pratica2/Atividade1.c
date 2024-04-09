#include <stdio.h>

int main() {
    int ano, idade; //Criação das variáveis inteiras ano e idade
    
    printf("Informe seu ano de nascimento: "); //Solicita o usuário informação do seu ano de nascimento
    scanf("%d", &ano); //Salva o ano de nascimento na variável ano
    idade = 2024 - ano; //Opera a idade estimada do usuário
    
    
    if (idade >= 18) { //Condicional, se você tem 18 anos ou mais, você pode tirar carteira de habilitação!
        printf("Voce pode tirar carteira de habilitacao!\n");
    } 
    
    else if (idade >= 16) { //Condicional, se você tem 16 anos ou mais, você pode votar!
        printf("Voce pode votar!\n");
    } 
    
    else { //Condicional restante, se você não tem 16 anos ou mais, você não pode votar nem tirar habilitação!
        printf("Voce ainda nao pode votar ou tirar carteira de habilitacao.\n");
    }
    
    getch();
    return 0;
}
