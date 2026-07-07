#include <stdio.h>

#define SIZE 10  // define o tamanho do vetor como 10

// funcao para ordenar o vetor em ordem decrescente usando bubble sort
void bubbleSortDesc(int arr[], int size) {
    int temp;
    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - 1 - i; j++) {
            if (arr[j] < arr[j + 1]) {  // compara elementos adjacentes
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;  // troca os elementos
            }
        }
    }
}

int main() {
    int arr[SIZE];

    // Preenchendo o vetor
    for (int i = 0; i < SIZE; i++) {
        printf("Digite o valor para arr[%d]: ", i + 1);
        scanf("%d", &arr[i]);  // le os valores e armazena no vetor
    }

    // Ordenando o vetor em ordem decrescente
    bubbleSortDesc(arr, SIZE);

    // Exibindo o vetor ordenado
    printf("Vetor ordenado em ordem decrescente:\n");
    for (int i = 0; i < SIZE; i++) {
        printf("%d ", arr[i]);  // exibe os valores ordenados
    }
    printf("\n");

    return 0;
}
