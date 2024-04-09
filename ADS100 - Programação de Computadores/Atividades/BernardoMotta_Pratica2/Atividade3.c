#include <stdio.h>

int main() {
    int ano, idade; //Cria as vari�veis inteiras ano e idade
    char categoria[10]; //Cria a vari�vel de caract�res de tamanho 10
    
    printf("Informe seu ano de nascimento: "); //Solicita o usu�rio informa��o do seu ano de nascimento
    scanf("%d", &ano); //Salva o ano de nascimento na vari�vel ano
    idade = 2024 - ano; //Opera a idade estimada do usu�rio
    
    if (idade >= 5 && idade <= 7) { //Condicional, se o usu�rio tem entre 5 e 7 anos, ent�o...
        strcpy(categoria, "Infantil A"); //Copia a string para a vari�vel categoria
    } 
    else if (idade >= 8 && idade <= 10) { //Condicional, se o usu�rio tem entre 8 e 10 anos, ent�o...
        strcpy(categoria, "Infantil B"); //Copia a string para a vari�vel categoria
    } 
    else if (idade >= 11 && idade <= 13) { //Condicional, se o usu�rio tem entre 11 e 13 anos, ent�o...
        strcpy(categoria, "Juvenil A"); //Copia a string para a vari�vel categoria
    } 
    else if (idade >= 14 && idade <= 17) { //Condicional, se o usu�rio tem entre 14 e 17 anos, ent�o...
        strcpy(categoria, "Juvenil B"); //Copia a string para a vari�vel categoria
    } 
    else if (idade >= 18) { //Condicional, se o usu�rio tem entre 5 e 7 anos, ent�o...
        strcpy(categoria, "Adulto"); //Copia a string para a vari�vel categoria
    } 
    else { //Condicional restantes, se o usu�rio tem menos de 5 anos, ent�o...
        printf("Voce nao tem idade para uma categoria recomendada!\n"); //Print o texto
        
        getch();
        return 0;
    }
    
    printf("A categoria recomendada baseada em sua idade e %s\n", categoria); //Printa o texto puxando a vari�vel categoria
    
    getch();
    return 0;
}
