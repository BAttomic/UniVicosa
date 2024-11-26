#include <iostream>
#define MAX 100

using namespace std;

class Pilha {
private:
    int topo;
    int itens[MAX];

public:
    Pilha() : topo(-1) {}

    bool cheia() { return topo == MAX - 1; }
    bool vazia() { return topo == -1; }

    void push(int valor) {
        if (!cheia()) itens[++topo] = valor;
    }

    int pop() {
        if (!vazia()) return itens[topo--];
        return -1;
    }

    int getTopo() {
        if (!vazia()) return itens[topo];
        return -1;
    }
};

int main() {
    Pilha minhaPilha;
    minhaPilha.push(10);
    minhaPilha.push(20);
    cout << "Topo da pilha: " << minhaPilha.getTopo() << endl;
    minhaPilha.pop();
    cout << "Topo após pop: " << minhaPilha.getTopo() << endl;

    return 0;
}
