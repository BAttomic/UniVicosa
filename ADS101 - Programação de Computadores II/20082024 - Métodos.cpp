#include <iostream>
#include <string>

using namespace std;

class Pessoa {
private:
    string Nome;

public:
    void setNome(string nome) {
        Nome = nome;
    }

    string getNome() const {
        return Nome;
    }
};

int main() {
    Pessoa pessoa;

    pessoa.setNome("José");
    cout << "Nome: " << pessoa.getNome() << endl;

    return 0;
}
