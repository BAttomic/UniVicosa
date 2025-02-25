#include <iostream>
#include <string>

using namespace std;

struct Pessoa {
    string nome;
    int idade;
};

int main() {
    Pessoa p;

    cout << "Digite o nome: ";
    cin >> p.nome;

    cout << "Digite a idade: ";
    cin >> p.idade;

    cout << "Nome: " << p.nome << ", Idade: " << p.idade << endl;

    return 0;
}
