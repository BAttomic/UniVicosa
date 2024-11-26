#include <iostream>
#include <stack>

using namespace std;

int main() {
    stack<int> pilha;
    int valor, soma = 0;

    // Inserindo valores na pilha
    for (int i = 1; i <= 5; i++) {
        cout << "Digite o valor " << i << ": ";
        cin >> valor;
        pilha.push(valor);
    }

    // Mostrando os valores e suas posições
    stack<int> tempPilha = pilha; // Pilha auxiliar para exibição
    int posicao = 1;
    while (!tempPilha.empty()) {
        cout << "O número na posição " << posicao++ << " é: " << tempPilha.top() << endl;
        tempPilha.pop();
    }

    // Exibindo soma durante a remoção
    cout << "\nSoma durante a remoção:\n";
    while (!pilha.empty()) {
        soma += pilha.top();
        cout << "Soma atual: " << soma << endl;
        pilha.pop();
    }

    // Soma total ao final
    cout << "\nSoma total dos valores: " << soma << endl;

    return 0;
}
