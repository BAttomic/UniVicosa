#include <stdio.h>

// Fun��o para calcular o d�gito verificador de uma conta corrente
int calcularDigitoVerificador(int numeroConta) {
    int inverso = 0, soma = 0, posicao = 1;

    // Calculando o inverso do n�mero da conta
    while (numeroConta > 0) {
        int digito = numeroConta % 10; // Pega o �ltimo d�gito
        inverso = inverso * 10 + digito; // Adiciona o d�gito ao inverso
        numeroConta /= 10; // Remove o �ltimo d�gito
    }

    // Somando o n�mero da conta com o seu inverso
    soma = numeroConta + inverso;

    // Multiplicando cada d�gito pela sua ordem posicional e somando
    while (soma > 0) {
        int digito = soma % 10; // Pega o �ltimo d�gito
        soma /= 10; // Remove o �ltimo d�gito
        soma += digito * posicao; // Multiplica o d�gito pela sua ordem posicional e adiciona � soma
        posicao++; // Incrementa a ordem posicional
    }

    // Retorna o �ltimo d�gito da soma (d�gito verificador)
    return soma % 10;
}

int main() {
    int numeroConta;
    
    printf("Digite o numero da conta corrente (com tres digitos): ");
    scanf("%d", &numeroConta);

    // Verifica se o n�mero da conta possui tr�s d�gitos
    if (numeroConta >= 100 && numeroConta <= 999) {
        int digitoVerificador = calcularDigitoVerificador(numeroConta);
        printf("O digito verificador da conta corrente %d e: %d\n", numeroConta, digitoVerificador);
    } else {
        printf("O numero da conta deve conter tres digitos.\n");
    }

    return 0;
}
