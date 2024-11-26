#include <stdio.h>

int main() {
    float notas[6][2]; // Array para armazenar as notas dos seis alunos
    float media, soma = 0;
    int i, aprovados = 0, exame = 0, reprovados = 0;

    // Recebe as notas dos seis alunos
    for (i = 0; i < 6; i++) {
        printf("Digite as duas notas do aluno %d: ", i + 1);
        scanf("%f %f", &notas[i][0], &notas[i][1]);
    }

    // Calcula a média, classificação e contagem de alunos
    for (i = 0; i < 6; i++) {
        media = (notas[i][0] + notas[i][1]) / 2;
        soma += media;
        printf("Media do aluno %d: %.2f - ", i + 1, media);

        if (media < 3) {
            printf("Reprovado\n");
            reprovados++;
        } else if (media >= 3 && media < 7) {
            printf("Exame\n");
            exame++;
        } else {
            printf("Aprovado\n");
            aprovados++;
        }
    }

    // Calcula a média da classe
    float mediaClasse = soma / 6;

    // Exibe o total de alunos aprovados, de exame, reprovados e a média da classe
    printf("\nTotal de alunos aprovados: %d\n", aprovados);
    printf("Total de alunos de exame: %d\n", exame);
    printf("Total de alunos reprovados: %d\n", reprovados);
    printf("Media da classe: %.2f\n", mediaClasse);

    return 0;
}
