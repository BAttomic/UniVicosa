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

    void depositar(double valor) {
        if (valor > 0) saldo += valor;
    }

    void sacar(double valor) {
        if (valor > 0 && valor <= saldo) saldo -= valor;
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
