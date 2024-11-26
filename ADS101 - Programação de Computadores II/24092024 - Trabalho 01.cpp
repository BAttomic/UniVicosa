#include <iostream>
#include <string>
#include <vector>

using namespace std;

class Pessoa {
protected:
    string nome;
    int idade;

public:
    Pessoa(string n, int i) : nome(n), idade(i) {}
    virtual void exibirInformacoes() const = 0; // Método virtual puro
    virtual ~Pessoa() {}
};

class Aluno : public Pessoa {
private:
    vector<double> notas;

public:
    Aluno(string n, int i, vector<double> ns) : Pessoa(n, i), notas(ns) {}

    void exibirInformacoes() const override {
        double soma = 0;
        for (double nota : notas) soma += nota;
        double media = soma / notas.size();

        cout << "Aluno: " << nome << "\nIdade: " << idade 
             << "\nMédia: " << media 
             << (media >= 60 ? " (Aprovado)" : " (Reprovado)") << endl;
    }
};

class Professor : public Pessoa {
private:
    double cargaHoraria;

public:
    Professor(string n, int i, double ch) : Pessoa(n, i), cargaHoraria(ch) {}

    void exibirInformacoes() const override {
        cout << "Professor: " << nome << "\nIdade: " << idade 
             << "\nCarga horária total: " << cargaHoraria << " horas" << endl;
    }
};

class Tecnico : public Pessoa {
private:
    string departamento;

public:
    Tecnico(string n, int i, string dep) : Pessoa(n, i), departamento(dep) {}

    void exibirInformacoes() const override {
        cout << "Técnico: " << nome << "\nIdade: " << idade 
             << "\nDepartamento: " << departamento << endl;
    }
};

int main() {
    vector<Pessoa*> pessoas;
    int opcao;

    do {
        cout << "\nMenu:\n1. Cadastro de Aluno\n2. Cadastro de Professor\n3. Cadastro de Técnico\n4. Sair\nEscolha: ";
        cin >> opcao;

        if (opcao == 1) {
            string nome;
            int idade, numNotas;
            vector<double> notas;

            cout << "Nome do aluno: ";
            cin.ignore();
            getline(cin, nome);

            cout << "Idade: ";
            cin >> idade;

            cout << "Quantas notas: ";
            cin >> numNotas;

            for (int i = 0; i < numNotas; i++) {
                double nota;
                cout << "Nota " << i + 1 << ": ";
                cin >> nota;
                notas.push_back(nota);
            }

            pessoas.push_back(new Aluno(nome, idade, notas));
        } else if (opcao == 2) {
            string nome;
            int idade;
            double cargaHoraria;

            cout << "Nome do professor: ";
            cin.ignore();
            getline(cin, nome);

            cout << "Idade: ";
            cin >> idade;

            cout << "Carga horária: ";
            cin >> cargaHoraria;

            pessoas.push_back(new Professor(nome, idade, cargaHoraria));
        } else if (opcao == 3) {
            string nome, departamento;
            int idade;

            cout << "Nome do técnico: ";
            cin.ignore();
            getline(cin, nome);

            cout << "Idade: ";
            cin >> idade;

            cout << "Departamento: ";
            cin.ignore();
            getline(cin, departamento);

            pessoas.push_back(new Tecnico(nome, idade, departamento));
        } else if (opcao != 4) {
            cout << "Opção inválida! Tente novamente." << endl;
        }
    } while (opcao != 4);

    cout << "\nExibindo informações cadastradas:\n";
    for (Pessoa* pessoa : pessoas) {
        pessoa->exibirInformacoes();
        cout << "-------------------------" << endl;
        delete pessoa;
    }

    return 0;
}
