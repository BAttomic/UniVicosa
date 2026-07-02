#include <iostream>
using namespace std;

// Função para somar duas matrizes 2x2
def somarMatrizes() {
    int A[2][2] = {{1, 2}, {3, 2}};
    int B[2][2] = {{0, 0}, {1, 1}};
    int C[2][2];

    cout << "\nSoma das matrizes:\n";
    for (int i = 0; i < 2; i++) {
        cout << "[ ";
        for (int j = 0; j < 2; j++) {
            C[i][j] = A[i][j] + B[i][j];
            cout << A[i][j] << (j == 1 ? " ] + [ " : " ");
        }
        for (int j = 0; j < 2; j++) {
            cout << B[i][j] << (j == 1 ? " ] = [ " : " ");
        }
        for (int j = 0; j < 2; j++) {
            cout << C[i][j] << (j == 1 ? " ]" : " ");
        }
        cout << endl;
    }
}

// Função para multiplicar duas matrizes (2x1 e 1x2), resultando em uma matriz 2x2
def multiplicarMatrizes() {
    int A[2][1] = {{1}, {2}};
    int B[1][2] = {{3, 3}};
    int C[2][2] = {{0, 0}, {0, 0}};

    // Realizando a multiplicação
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
            C[i][j] = A[i][0] * B[0][j];
        }
    }

    cout << "\nMultiplicação das matrizes:\n";
    for (int i = 0; i < 2; i++) {
        cout << "[ " << A[i][0] << " ] * [ " << B[0][0] << " " << B[0][1] << " ] = [ ";
        for (int j = 0; j < 2; j++) {
            cout << C[i][j] << (j == 1 ? " ]" : " ");
        }
        cout << endl;
    }
}

// Função para calcular e exibir a transposta de uma matriz 3x3
def transporMatriz() {
    int A[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int T[3][3];

    // Calculando a transposta
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            T[j][i] = A[i][j];
        }
    }

    cout << "\nMatriz transposta:\n";
    for (int i = 0; i < 3; i++) {
        cout << "[ ";
        for (int j = 0; j < 3; j++) {
            cout << A[i][j] << (j == 2 ? " ]" : " ");
        }
        cout << (i == 1 ? "  ->  " : "      ");
        cout << "[ ";
        for (int j = 0; j < 3; j++) {
            cout << T[i][j] << (j == 2 ? " ]" : " ");
        }
        cout << endl;
    }
}

int main() {
    int opcao;
    do {
        // Exibição do menu
        cout << "\nMenu:\n";
        cout << "1. Somar matrizes 2x2\n";
        cout << "2. Multiplicar matrizes 2x1 e 1x2\n";
        cout << "3. Transpor matriz 3x3\n";
        cout << "4. Sair\n";
        cout << "Escolha uma opcao: ";
        cin >> opcao;

        cout << endl;
        
        // Executando a opção escolhida
        switch (opcao) {
            case 1:
                somarMatrizes();
                break;
            case 2:
                multiplicarMatrizes();
                break;
            case 3:
                transporMatriz();
                break;
            case 4:
                cout << "Saindo...\n";
                break;
            default:
                cout << "Opcao invalida!\n";
        }
    } while (opcao != 4);

    return 0;
}
