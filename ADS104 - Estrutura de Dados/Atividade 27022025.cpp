#include <iostream>
using namespace std;

void calculadoraSimples() {
    double resultado, num2;
    char operacao;
    bool primeiroInput = true;

    cout << "Calculadora Simples - Digite '.' como operação para sair\n";
    
    while (true) {
        if (primeiroInput) {
            cout << "Digite o primeiro número: ";
            cin >> resultado;
            primeiroInput = false;
        }

        cout << "Digite a operação (+, -, *, /) ou '.' para sair: ";
        cin >> operacao;
        
        if (operacao == '.') {
            cout << "Encerrando a calculadora." << endl;
            break;
        }

        cout << "Digite o próximo número: ";
        cin >> num2;
        
        // Realiza a operação com switch
        switch (operacao) {
            case '+':
                resultado += num2;
                break;
            case '-':
                resultado -= num2;
                break;
            case '*':
                resultado *= num2;
                break;
            case '/':
                if (num2 != 0) {
                    resultado /= num2;
                } else {
                    cout << "Erro! Divisão por zero." << endl;
                    continue;
                }
                break;
            default:
                cout << "Operação inválida!" << endl;
                continue;
        }
        cout << "Resultado: " << resultado << endl;
    }
}

int main() {
    calculadoraSimples();
    return 0;
}
