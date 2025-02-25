#include <iostream>
#include <string>

using namespace std;

class ContaBancaria {
private:
    string nomeCliente;
    double saldo;

public:
    ContaBancaria(const string& nome, double saldoInicial)
        : nomeCliente(nome), saldo(saldoInicial) {}

    string depositar(double valor) {
        if (valor > 0) {
            saldo += valor;
            return "Deposito de " + to_string(valor) + " realizado com sucesso.";
        }
        return "Valor de deposito invalido.";
    }

    string sacar(double valor) {
        if (valor > 0 && valor <= saldo) {
            saldo -= valor;
            return "Saque de " + to_string(valor) + " realizado com sucesso.";
        }
        return "Saque nao realizado. Saldo insuficiente ou valor invalido.";
    }

    double getSaldo() const { return saldo; }
};

int main() {
    ContaBancaria conta("João", 1000.0);

    conta.depositar(200.0);
    conta.sacar(150.0);

    cout << "Saldo atual: " << conta.getSaldo() << endl;

    return 0;
}
