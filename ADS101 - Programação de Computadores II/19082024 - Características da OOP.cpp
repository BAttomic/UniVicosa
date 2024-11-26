#include <iostream>
#include <string>

using namespace std;

class Pessoa {
public:
    int Id;
    string Nome;
    int Idade;
};

int main() {
    Pessoa pessoa;

    pessoa.Id = 1;
    pessoa.Nome = "José";
    pessoa.Idade = 30;

    cout << "Id: " << pessoa.Id << endl;
    cout << "Nome: " << pessoa.Nome << endl;
    cout << "Idade: " << pessoa.Idade << endl;

    return 0;
}
