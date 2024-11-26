#include <iostream>
#include <queue>
#include <string>

using namespace std;

class Pessoa {
private:
    string nome;
    int quantidadeIngressos;

public:
    Pessoa(string n, int q) : nome(n), quantidadeIngressos(q) {}

    string getNome() const { return nome; }
    int getQuantidadeIngressos() const { return quantidadeIngressos; }
};

class FilaIngressos {
private:
    queue<Pessoa> fila;

public:
    void adicionarPessoa(const Pessoa& pessoa) { fila.push(pessoa); }

    void processarFila() {
        while (!fila.empty()) {
            Pessoa clienteAtual = fila.front();
            cout << clienteAtual.getNome() << " comprou " 
                 << clienteAtual.getQuantidadeIngressos() << " ingresso(s)." << endl;
            fila.pop();
        }
    }
};

int main() {
    FilaIngressos filaIngressos;

    filaIngressos.adicionarPessoa(Pessoa("Ana", 2));
    filaIngressos.adicionarPessoa(Pessoa("Carlos", 3));
    filaIngressos.adicionarPessoa(Pessoa("Beatriz", 1));

    filaIngressos.processarFila();

    return 0;
}
