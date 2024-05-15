#include <stdio.h>

int main() {
    float nota1, nota2, nota3, media;
    printf("Digite as três notas do aluno: ");
    scanf("%f %f %f", &nota1, &nota2, &nota3);

    // Calcula a média aritmética
    media = (nota1 + nota2 + nota3) / 3;
    printf("A média do aluno é: %.2f\n", media);

    // Verifica em qual faixa de notas o aluno se encontra e exibe a mensagem correspondente
    if (media < 3) {
        printf("Reprovado\n");
    } else if (media < 7) {
        printf("\nReprovado, porém poderá fazer exame\n");

        // Calcula a nota necessária para passar no exame
        printf("Nota necessária no exame: %.2f\n", 12 - media);
    } else {
        printf("Aprovado\n");
    }
    return 0;
}
