#include <iostream>

using namespace std;

// Protótipo da função
int soma(int a, int b);

int main() {
    cout << "A soma é: " << soma(10, 20) << endl;
    return 0;
}

// Implementação da função
int soma(int a, int b) {
    return a + b;
}
