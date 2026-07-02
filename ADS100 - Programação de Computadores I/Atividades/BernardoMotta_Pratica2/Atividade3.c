#include <stdio.h>

int main() {
    int ano, idade; //Cria as variáveis inteiras ano e idade
    char categoria[10]; //Cria a variável de caractéres de tamanho 10
    
    printf("Informe seu ano de nascimento: "); //Solicita o usuário informação do seu ano de nascimento
    scanf("%d", &ano); //Salva o ano de nascimento na variável ano
    idade = 2024 - ano; //Opera a idade estimada do usuário
    
    if (idade >= 5 && idade <= 7) { //Condicional, se o usuário tem entre 5 e 7 anos, então...
        strcpy(categoria, "Infantil A"); //Copia a string para a variável categoria
    } 
    else if (idade >= 8 && idade <= 10) { //Condicional, se o usuário tem entre 8 e 10 anos, então...
        strcpy(categoria, "Infantil B"); //Copia a string para a variável categoria
    } 
    else if (idade >= 11 && idade <= 13) { //Condicional, se o usuário tem entre 11 e 13 anos, então...
        strcpy(categoria, "Juvenil A"); //Copia a string para a variável categoria
    } 
    else if (idade >= 14 && idade <= 17) { //Condicional, se o usuário tem entre 14 e 17 anos, então...
        strcpy(categoria, "Juvenil B"); //Copia a string para a variável categoria
    } 
    else if (idade >= 18) { //Condicional, se o usuário tem entre 5 e 7 anos, então...
        strcpy(categoria, "Adulto"); //Copia a string para a variável categoria
    } 
    else { //Condicional restantes, se o usuário tem menos de 5 anos, então...
        printf("Voce nao tem idade para uma categoria recomendada!\n"); //Print o texto
        
        getch();
        return 0;
    }
    
    printf("A categoria recomendada baseada em sua idade e %s\n", categoria); //Printa o texto puxando a variável categoria
    
    getch();
    return 0;
}
