#include <stdio.h>

// Função para calcular o dígito verificador de uma conta corrente
int calcularDigitoVerificador(int numeroConta) {
    int inverso = 0, soma = 0, posicao = 1;

    // Calculando o inverso do número da conta
    while (numeroConta > 0) {
        int digito = numeroConta % 10; // Pega o último dígito
        inverso = inverso * 10 + digito; // Adiciona o dígito ao inverso
        numeroConta /= 10; // Remove o último dígito
    }

    // Somando o número da conta com o seu inverso
    soma = numeroConta + inverso;

    // Multiplicando cada dígito pela sua ordem posicional e somando
    while (soma > 0) {
        int digito = soma % 10; // Pega o último dígito
        soma /= 10; // Remove o último dígito
        soma += digito * posicao; // Multiplica o dígito pela sua ordem posicional e adiciona à soma
        posicao++; // Incrementa a ordem posicional
    }

    // Retorna o último dígito da soma (dígito verificador)
    return soma % 10;
}

int main() {
    int numeroConta;
    
    printf("Digite o numero da conta corrente (com tres digitos): ");
    scanf("%d", &numeroConta);

    // Verifica se o número da conta possui três dígitos
    if (numeroConta >= 100 && numeroConta <= 999) {
        int digitoVerificador = calcularDigitoVerificador(numeroConta);
        printf("O digito verificador da conta corrente %d e: %d\n", numeroConta, digitoVerificador);
    } else {
        printf("O numero da conta deve conter tres digitos.\n");
    }

    return 0;
}
