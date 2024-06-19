#include <stdio.h>

#define NUM_ALUNOS 20
#define NUM_NOTAS 10

int main() {
    float notas[NUM_ALUNOS][NUM_NOTAS]; // Array para armazenar as notas dos alunos
    float media_aluno[NUM_ALUNOS]; // Array para armazenar a média de cada aluno
    float media_turma = 0; // Variável para armazenar a média da turma
    int alunos_aprovados = 0; // Contador para alunos aprovados

    // Recebendo as notas dos alunos
    for (int i = 0; i < NUM_ALUNOS; i++) {
        printf("Digite as dez notas do aluno %d:\n", i + 1);
        for (int j = 0; j < NUM_NOTAS; j++) {
            scanf("%f", &notas[i][j]);
            media_aluno[i] += notas[i][j]; // Calculando a soma das notas do aluno
        }
        media_aluno[i] /= NUM_NOTAS; // Calculando a média do aluno
        media_turma += media_aluno[i]; // Adicionando a média do aluno à média da turma
        if (media_aluno[i] >= 5.0) {
            alunos_aprovados++; // Incrementando o contador se o aluno foi aprovado
        }
    }

    // Calculando a média da turma
    media_turma /= NUM_ALUNOS;

    // Imprimindo média de cada aluno e média da turma
    printf("\nMedia de cada aluno:\n");
    for (int i = 0; i < NUM_ALUNOS; i++) {
        printf("Aluno %d: %.2f\n", i + 1, media_aluno[i]);
    }
    printf("\nMedia da turma: %.2f\n", media_turma);

    // Calculando e imprimindo percentual de alunos aprovados
    float percentual_aprovados = ((float)alunos_aprovados / NUM_ALUNOS) * 100;
    printf("\nPercentual de alunos aprovados: %.2f%%\n", percentual_aprovados);

    return 0;
}
