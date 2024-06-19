#include <stdio.h>

#define NUM_PROVAS 5
#define NOTA_MINIMA 5.0

int main() {
    int num_alunos;
    float notas[100][NUM_PROVAS]; // Array para armazenar as notas dos alunos
    char nomes[100][50]; // Array para armazenar os nomes dos alunos
    int alunos_aprovados_total = 0; // Contador para alunos aprovados em todas as matérias
    int alunos_aprovados_14 = 0; // Contador para alunos aprovados nas matérias 1 e 4
    int alunos_materia3 = 0; // Contador para alunos aprovados na matéria 3

    printf("Digite o número de alunos:\n");
    scanf("%d", &num_alunos);

    printf("Digite os nomes e notas dos alunos:\n");
    for (int i = 0; i < num_alunos; i++) {
        printf("Aluno %d:\n", i + 1);
        scanf("%s", nomes[i]);
        for (int j = 0; j < NUM_PROVAS; j++) {
            scanf("%f", &notas[i][j]);
        }

        // Verificando aprovação nas matérias
        int aprovado_total = 1;
        int aprovado_14 = 0;
        for (int j = 0; j < NUM_PROVAS; j++) {
            if (notas[i][j] < NOTA_MINIMA) {
                aprovado_total = 0;
            }
            if ((j == 0 || j == 3) && notas[i][j] >= NOTA_MINIMA) {
                aprovado_14 = 1;
            }
            if (j == 2 && notas[i][j] >= NOTA_MINIMA) {
                alunos_materia3++;
            }
        }
        if (aprovado_total) {
            printf("Aluno %s foi aprovado em todas as matérias.\n", nomes[i]);
            alunos_aprovados_total++;
        }
        if (aprovado_14) {
            printf("Aluno %s foi aprovado nas matérias 1 e 4.\n", nomes[i]);
            alunos_aprovados_14++;
        }
    }

    float percentual_materia3 = ((float)alunos_materia3 / num_alunos) * 100;

    printf("Porcentagem de alunos aprovados na matéria 3: %.2f%%\n", percentual_materia3);

    return 0;
}
