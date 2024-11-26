#include <iostream>
#include <string>

using namespace std;

class Animal {
public:
    virtual void fazerSom() const {
        cout << "Animal faz um som genérico." << endl;
    }
};

class Cachorro : public Animal {
public:
    void fazerSom() const override {
        cout << "Cachorro faz: Au Au!" << endl;
    }
};

class Gato : public Animal {
public:
    void fazerSom() const override {
        cout << "Gato faz: Miau!" << endl;
    }
};

int main() {
    Animal* animal1 = new Cachorro();
    Animal* animal2 = new Gato();

    animal1->fazerSom();
    animal2->fazerSom();

    delete animal1;
    delete animal2;

    return 0;
}
