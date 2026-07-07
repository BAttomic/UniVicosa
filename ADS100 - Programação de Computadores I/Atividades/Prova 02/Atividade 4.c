#include <stdio.h>

int main() {
    
    float nota1, nota2, nota3, media;
    
    // Solicita ao aluno suas 3 notas
    printf("Digite as tres notas do aluno: ");
    scanf("%f %f %f", &nota1, &nota2, &nota3);
    
    // Calcula a média aritmética
    media = (nota1 + nota2 + nota3) / 3;
    printf("A media do aluno e: %.2f\n", media);
    
    // Verifica em qual faixa de notas o aluno se encontra e exibe a mensagem correspondente
    if (media < 3) {
       printf("Reprovado\n");
    }
    // Calcula a nota necessária para passar no exame
    else if (media < 7) {
         printf("\nReprovado, porem podera fazer exame\n");
         printf("Nota necessaria no exame: %.2f\n", 12 - media);
    }
    else {
         printf("Aprovado\n");
    }
    
    getch();
    return 0;
}
