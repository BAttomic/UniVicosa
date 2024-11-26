#include <iostream>
#include <string>
#include <vector>

using namespace std;

class Midia {
protected:
    string titulo;

public:
    Midia(string t) : titulo(t) {}
    virtual void exibirInformacoes() const = 0;
    virtual ~Midia() {}
};

class DVD : public Midia {
private:
    int duracao;

public:
    DVD(string t, int d) : Midia(t), duracao(d) {}

    void exibirInformacoes() const override {
        cout << "DVD: " << titulo << "\nDuração: " << duracao << " minutos" << endl;
    }
};

class CD : public Midia {
private:
    int faixas;

public:
    CD(string t, int f) : Midia(t), faixas(f) {}

    void exibirInformacoes() const override {
        cout << "CD: " << titulo << "\nNúmero de faixas: " << faixas << endl;
    }
};

class LP : public Midia {
private:
    string gravadora;

public:
    LP(string t, string g) : Midia(t), gravadora(g) {}

    void exibirInformacoes() const override {
        cout << "LP: " << titulo << "\nGravadora: " << gravadora << endl;
    }
};

class Livro : public Midia {
private:
    string autor;

public:
    Livro(string t, string a) : Midia(t), autor(a) {}

    void exibirInformacoes() const override {
        cout << "Livro: " << titulo << "\nAutor: " << autor << endl;
    }
};

int main() {
    vector<Midia*> midias;
    int opcao;

    do {
        cout << "\nMenu:\n1. Cadastrar DVD\n2. Cadastrar CD\n3. Cadastrar LP\n4. Cadastrar Livro\n5. Exibir todos\n6. Sair\nEscolha: ";
        cin >> opcao;

        if (opcao == 1) {
            string titulo;
            int duracao;

            cout << "Título do DVD: ";
            cin.ignore();
            getline(cin, titulo);

            cout << "Duração (min): ";
            cin >> duracao;

            midias.push_back(new DVD(titulo, duracao));
        } else if (opcao == 2) {
            string titulo;
            int faixas;

            cout << "Título do CD: ";
            cin.ignore();
            getline(cin, titulo);

            cout << "Número de faixas: ";
            cin >> faixas;

            midias.push_back(new CD(titulo, faixas));
        } else if (opcao == 3) {
            string titulo, gravadora;

            cout << "Título do LP: ";
            cin.ignore();
            getline(cin, titulo);

            cout << "Gravadora: ";
            getline(cin, gravadora);

            midias.push_back(new LP(titulo, gravadora));
        } else if (opcao == 4) {
            string titulo, autor;

            cout << "Título do Livro: ";
            cin.ignore();
            getline(cin, titulo);

            cout << "Autor: ";
            getline(cin, autor);

            midias.push_back(new Livro(titulo, autor));
        } else if (opcao == 5) {
            for (Midia* midia : midias) {
                midia->exibirInformacoes();
                cout << "-------------------------" << endl;
            }
        } else if (opcao != 6) {
            cout << "Opção inválida! Tente novamente." << endl;
        }
    } while (opcao != 6);

    for (Midia* midia : midias) delete midia;

    return 0;
}
