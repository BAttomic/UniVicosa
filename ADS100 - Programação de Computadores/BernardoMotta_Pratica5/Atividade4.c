#include <stdio.h>
#include <stdlib.h>

#define NUM_CIDADES 5

int main() {
    int codigos[NUM_CIDADES], veiculos[NUM_CIDADES], acidentes[NUM_CIDADES];
    int i, total_veiculos = 0, total_acidentes_peq = 0, cont_acidentes_peq = 0;
    int maior_indice = 0, menor_indice = 0;

    for (i = 0; i < NUM_CIDADES; i++) {
        printf("Digite o codigo da cidade %d: ", i + 1);
        scanf("%d", &codigos[i]);
        printf("Digite o numero de veiculos de passeio em 2007: ");
        scanf("%d", &veiculos[i]);
        printf("Digite o numero de acidentes de transito com vitimas em 2007: ", i + 1);
        scanf("%d", &acidentes[i]);

        if (i == 0) {
            maior_indice = menor_indice = i;
        } else {
            if (acidentes[i] > acidentes[maior_indice]) maior_indice = i;
            if (acidentes[i] < acidentes[menor_indice]) menor_indice = i;
        }

        total_veiculos += veiculos[i];
        if (veiculos[i] < 2000) {
            total_acidentes_peq += acidentes[i];
            cont_acidentes_peq++;
        }
    }

    printf("Maior indice de acidentes: Cidade %d com %d acidentes\n", codigos[maior_indice], acidentes[maior_indice]);
    printf("Menor indice de acidentes: Cidade %d com %d acidentes\n", codigos[menor_indice], acidentes[menor_indice]);
    printf("Media de veiculos nas cinco cidades: %.2f\n", total_veiculos / (float)NUM_CIDADES);
    if (cont_acidentes_peq > 0) {
        printf("Media de acidentes nas cidades com menos de 2000 veiculos: %.2f\n", total_acidentes_peq / (float)cont_acidentes_peq);
    } else {
        printf("Nao ha cidades com menos de 2000 veiculos.\n");
    }

    system("pause");
    return 0;
}
