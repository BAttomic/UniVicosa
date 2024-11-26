#include <iostream>
#include <string>

using namespace std;

class ContaBancaria {
protected:
    string nomeCliente;
    double saldo;

public:
    ContaBancaria(const string& nome, double saldoInicial) : nomeCliente(nome), saldo(saldoInicial) {}

    virtual void aplicarCorrecao() = 0;
    virtual void exibirDetalhes() const {
        cout << "Cliente: " << nomeCliente << "\nSaldo: R$ " << saldo << endl;
    }

    virtual ~ContaBancaria() {}
};

class ContaCorrente : public ContaBancaria {
public:
    ContaCorrente(const string& nome, double saldoInicial) : ContaBancaria(nome, saldoInicial) {}

    void aplicarCorrecao() override {
        cout << "Conta Corrente não possui correção.\n";
    }

    void exibirDetalhes() const override {
        cout << "Tipo: Conta Corrente\n";
        ContaBancaria::exibirDetalhes();
    }
};

class ContaPoupanca : public ContaBancaria {
private:
    double taxaCorrecao;

public:
    ContaPoupanca(const string& nome, double saldoInicial, double taxa)
        : ContaBancaria(nome, saldoInicial), taxaCorrecao(taxa) {}

    void aplicarCorrecao() override {
        saldo += saldo * (taxaCorrecao / 100);
    }

    void exibirDetalhes() const override {
        cout << "Tipo: Conta Poupança\n";
        ContaBancaria::exibirDetalhes();
        cout << "Taxa de correção: " << taxaCorrecao << "%\n";
    }
};

int main() {
    ContaCorrente conta1("João", 1000.0);
    ContaPoupanca conta2("Maria", 2000.0, 2.0);

    conta1.exibirDetalhes();
    conta1.aplicarCorrecao();

    cout << endl;

    conta2.exibirDetalhes();
    conta2.aplicarCorrecao();
    conta2.exibirDetalhes();

    return 0;
}
