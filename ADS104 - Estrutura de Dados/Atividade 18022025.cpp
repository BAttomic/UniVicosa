#include <iostream>
using namespace std;

// Função para obter entrada do usuário
void userInput(int arr[2]) {
    cout << "Digite o valor de A: ";
    cin >> arr[0];
    cout << "Digite o valor de B: ";
    cin >> arr[1];
}

// Função para trocar os valores usando uma variável temporária
void ordernarValores(int arr[2]) {
    int temp = arr[0];
    arr[0] = arr[1];
    arr[1] = temp;
}

// Função para exibir os valores
void mostrarValores(const int arr[2]) {
    cout << "Valor de A: " << arr[0] << "\n";
    cout << "Valor de B: " << arr[1] << "\n";
}

int main() {
    int arr[2];
    
    // Obtém os valores do usuário
    userInput(arr);
    
    cout << "\nAntes da troca:" << endl;
    mostrarValores(arr);
    
    // Troca os valores
    ordernarValores(arr);
    
    cout << "\nDepois da troca:" << endl;
    mostrarValores(arr);
    
    return 0;
}
