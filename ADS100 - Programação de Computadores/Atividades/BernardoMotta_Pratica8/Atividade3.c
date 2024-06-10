#include <stdio.h>
#include <string.h>

#define MAX_SIZE 199  // define o tamanho maximo da frase

// funcao para contar a quantidade de vogais em uma string
int countVogais(char str[]) {
    int count = 0;
    for (int i = 0; i < strlen(str); i++) {  // percorre cada caractere da string
        char c = str[i];
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' ||
            c == 'A' || c == 'E' || c == 'I' || c == 'O' || c == 'U') {  // verifica se e uma vogal
            count++;  // incrementa o contador
        }
    }
    return count;
}

int main() {
    char frase[MAX_SIZE + 1];  // declara a string com tamanho maximo + 1 para o caractere nulo

    // Recebendo a frase do usuario
    printf("Digite uma frase (maximo %d caracteres): ", MAX_SIZE);
    fgets(frase, MAX_SIZE + 1, stdin);  // le a frase do usuario

    // Calculando e exibindo a quantidade de vogais
    int numVogais = countVogais(frase);
    printf("Quantidade de vogais na frase: %d\n", numVogais);  // exibe o numero de vogais

    return 0;
}
