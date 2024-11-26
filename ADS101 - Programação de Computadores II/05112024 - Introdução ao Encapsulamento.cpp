#include <iostream>

using namespace std;

class Retangulo {
private:
    double largura;
    double altura;

public:
    Retangulo(double larg, double alt) {
        setLargura(larg);
        setAltura(alt);
    }

    void setLargura(double larg) {
        largura = larg > 0 ? larg : 1.0;
    }

    void setAltura(double alt) {
        altura = alt > 0 ? alt : 1.0;
    }

    double calcularArea() const {
        return largura * altura;
    }
};

int main() {
    Retangulo ret(5.0, 3.0);
    cout << "Área do retângulo: " << ret.calcularArea() << endl;

    return 0;
}
