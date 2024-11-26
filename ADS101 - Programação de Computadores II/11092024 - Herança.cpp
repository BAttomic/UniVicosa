#include <iostream>
#include <string>

using namespace std;

class Animal {
public:
    string nome;

    Animal(string n) : nome(n) {}

    void dormir() {
        cout << nome << " está dormindo." << endl;
    }
};

class Cachorro : public Animal {
public:
    string raca;

    Cachorro(string n, string r) : Animal(n), raca(r) {}

    void latir() {
        cout << nome << " está latindo!" << endl;
    }

    void dormir() {
        cout << nome << " um cachorro da raça " << raca << " está dormindo." << endl;
    }
};

int main() {
    Animal animal("Animal Genérico");
    animal.dormir();

    Cachorro cachorro("Bolt", "Pastor Alemão");
    cachorro.dormir();
    cachorro.latir();

    return 0;
}
