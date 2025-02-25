#include <iostream>
#include <string>
#include <sstream>

using namespace std;

class ContaBancaria {
private:
    string nomeCliente;
    double saldo;

    string formatarValor(double valor) {
        ostringstream stream;
        stream.precision(2);
        stream << fixed << valor;
        return stream.str();
    }

public:
    ContaBancaria(const string& nome, double saldoInicial): nomeCliente(nome), saldo(saldoInicial) {}

    string depositar(double valor) {
        if (valor > 0) {
            saldo += valor;
            return "Deposito de " + formatarValor(valor) + " realizado com sucesso.";
        }
        return "Valor de deposito invalido.";
    }

    string sacar(double valor) {
        if (valor > 0 && valor <= saldo) {
            saldo -= valor;
            return "Saque de " + formatarValor(valor) + " realizado com sucesso.";
        }
        return "Saque nao realizado. Saldo insuficiente ou valor invalido.";
    }

    double getSaldo() const { return saldo; }
};

int main() {
    ContaBancaria conta("João", 1000.0);

    cout << conta.depositar(200.0) << endl;
    cout << conta.sacar(150.0) << endl;
    cout << conta.sacar(2000.0) << endl; // Tentativa de saque com saldo insuficiente

    cout << "Saldo atual: " << conta.getSaldo() << endl;

    return 0;
}
