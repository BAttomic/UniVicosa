#include<stdio.h>
#include<conio.h>

int main() {
    float nota1, nota2, media, somaMedias = 0;
    int contadorAprovados = 0;
    int totalAlunos = 10;
    int i;

    for (i = 0; i < totalAlunos; i++) {
        printf("Aluno %d\n", i + 1);
        printf("Informe a primeira nota: ");
        scanf("%f", &nota1);
        printf("Informe a segunda nota: ");
        scanf("%f", &nota2);

        media = (nota1 + nota2) / 2;
        printf("Media do aluno %d: %.2f\n", i + 1, media);

        somaMedias += media;

        if (media >= 6) {
            contadorAprovados++;
        }
    }

    float mediaTurma = somaMedias / totalAlunos;
    float percentualAprovados = (contadorAprovados / (float)totalAlunos) * 100;

    printf("Media da turma: %.2f\n", mediaTurma);
    printf("Percentual de alunos com m�dia maior ou igual a 6: %.2f%%\n", percentualAprovados);

    getch();
    return 0;
}
