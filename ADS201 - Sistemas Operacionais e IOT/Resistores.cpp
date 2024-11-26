#include <iostream>
#include <string>
#include <cmath>
using namespace std;

// Mapeamento de cores para valores
int corParaValor(string cor) {
    if (cor == "preto") return 0;
    if (cor == "marrom") return 1;
    if (cor == "vermelho") return 2;
    if (cor == "laranja") return 3;
    if (cor == "amarelo") return 4;
    if (cor == "verde") return 5;
    if (cor == "azul") return 6;
    if (cor == "violeta") return 7;
    if (cor == "cinza") return 8;
    if (cor == "branco") return 9;
    return -1;
}

// Mapeamento inverso: valores para cores
string valorParaCor(int valor) {
    switch (valor) {
        case 0: return "preto";
        case 1: return "marrom";
        case 2: return "vermelho";
        case 3: return "laranja";
        case 4: return "amarelo";
        case 5: return "verde";
        case 6: return "azul";
        case 7: return "violeta";
        case 8: return "cinza";
        case 9: return "branco";
        default: return "invalido";
    }
}

int main() {
    int opcao;
    cout << "Escolha uma opção:\n1. Converter cores para valor\n2. Converter valor para cores\nOpção: ";
    cin >> opcao;

    if (opcao == 1) {
        string cor1, cor2, multiplicador;
        cout << "Digite a 1ª cor: ";
        cin >> cor1;
        cout << "Digite a 2ª cor: ";
        cin >> cor2;
        cout << "Digite a cor do multiplicador: ";
        cin >> multiplicador;

        int valor = (corParaValor(cor1) * 10 + corParaValor(cor2)) * pow(10, corParaValor(multiplicador));
        cout << "Valor do resistor: " << valor << " Ohms" << endl;
    } else if (opcao == 2) {
        int valorResistor;
        cout << "Digite o valor do resistor em Ohms: ";
        cin >> valorResistor;

        int digito1 = valorResistor / 10 % 10;
        int digito2 = valorResistor % 10;
        int multiplicador = log10(valorResistor / 10);

        cout << "Cores do resistor: "
             << valorParaCor(digito1) << ", "
             << valorParaCor(digito2) << ", "
             << valorParaCor(multiplicador) << endl;
    } else {
        cout << "Opção inválida!" << endl;
    }

    return 0;
}
