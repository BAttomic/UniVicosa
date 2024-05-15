#include <stdio.h>

int main() {
    float nota1, nota2, nota3, media;
    printf("Digite as tr�s notas do aluno: ");
    scanf("%f %f %f", &nota1, &nota2, &nota3);

    // Calcula a m�dia aritm�tica
    media = (nota1 + nota2 + nota3) / 3;
    printf("A m�dia do aluno �: %.2f\n", media);

    // Verifica em qual faixa de notas o aluno se encontra e exibe a mensagem correspondente
    if (media < 3) {
        printf("Reprovado\n");
    } else if (media < 7) {
        printf("\nReprovado, por�m poder� fazer exame\n");

        // Calcula a nota necess�ria para passar no exame
        printf("Nota necess�ria no exame: %.2f\n", 12 - media);
    } else {
        printf("Aprovado\n");
    }
    return 0;
}
