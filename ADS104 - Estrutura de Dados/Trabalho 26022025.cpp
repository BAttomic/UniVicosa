#include <iostream>   // Entrada e saída (cin, cout)
#include <cmath>      // Funções matemáticas (sqrt, pow, abs)
#include <cstdlib>    // Geração de números aleatórios (rand, srand)
#include <ctime>      // Manipulação de tempo (time, clock)
#include <map>        // Estrutura de dados map (Dicionário)
#include <vector>     // Vetor dinâmico (std::vector)
#include <climits>    // Constantes de limite (INT_MIN, INT_MAX)

using namespace std;

// Funções das atividades
void verificarParImpar() {
    int numero;
    
    // Solicita um número ao usuário
    cout << "Digite um numero inteiro: ";
    cin >> numero;

    // Verifica se é par ou ímpar
    if (numero % 2 == 0) {
        cout << "Par" << endl;
    } else {
        cout << "Ímpar" << endl;
    }
}
void verificarMaioridade() {
    int idade;
    
    // Solicita a idade do usuário
    cout << "Digite sua idade: ";
    cin >> idade;

    // Verifica se a idade é inválida
    if (idade < 0) {
        cout << "Idade inválida! Insira um numero natural" << endl;
    } else if (idade >= 18) {
        cout << "Maior de idade" << endl;
    } else {
        cout << "Menor de idade" << endl;
    }
}
void maiorDeDoisNumeros() {
    int num1, num2;
    
    // Solicita dois números ao usuário
    cout << "Digite o primeiro numero: ";
    cin >> num1;
    cout << "Digite o segundo numero: ";
    cin >> num2;

    // Compara os números e exibe o resultado
    if (num1 > num2) {
        cout << "O maior numero é " << num1 << endl;
    } else if (num2 > num1) {
        cout << "O maior numero é " << num2 << endl;
    } else {
        cout << "Os numeros são iguais" << endl;
    }
}
void classificacaoNotas() {
    int nota;
    
    // Solicita a nota do aluno
    cout << "Digite a nota do aluno (0 a 100): ";
    cin >> nota;

    // Verifica se a nota é inválida
    if (nota < 0 || nota > 100) {
        cout << "Nota inválida! Insira um valor entre 0 e 100." << endl;
    } else if (nota >= 90) {
        cout << "Aprovado com Excelência" << endl;
    } else if (nota >= 70) {
        cout << "Aprovado" << endl;
    } else {
        cout << "Reprovado" << endl;
    }
}
void numeroPositivoNegativoZero() {
    int numero;
    
    // Solicita um número ao usuário
    cout << "Digite um numero: ";
    cin >> numero;

    // Verifica se o número é positivo, negativo ou zero
    if (numero > 0) {
        cout << "Positivo" << endl;
    } else if (numero < 0) {
        cout << "Negativo" << endl;
    } else {
        cout << "Zero" << endl;
    }
}
void verificacaoAnoBissexto() {
    int ano;
    
    // Solicita o ano ao usuário
    cout << "Digite um ano: ";
    cin >> ano;

    // Verifica se o ano é bissexto
    if ((ano % 4 == 0 && ano % 100 != 0) || (ano % 400 == 0)) {
        cout << "Ano bissexto" << endl;
    } else {
        cout << "Ano não bissexto" << endl;
    }
}
void acessoAoSistema() {
    string usuario, senha;
    
    // Solicita nome de usuário e senha
    cout << "Digite o nome de usuario: ";
    cin >> usuario;
    cout << "Digite a senha: ";
    cin >> senha;

    // Verifica se o usuário e a senha estão corretos
    if (usuario == "admin" && senha == "1234") {
        cout << "Acesso concedido" << endl;
    } else {
        cout << "Acesso negado" << endl;
    }
}
void calculoDesconto() {
    int valorCompra;
    double desconto = 0.0;
    
    // Solicita o valor da compra ao usuário
    cout << "Digite o valor da compra (somente numeros naturais): ";
    cin >> valorCompra;

    // Verifica se a entrada é um número natural (inteiro não negativo)
    if (valorCompra < 0) {
        cout << "Entrada invalida. Por favor, digite um numero natural." << endl;
        return; // Encerra a função se o valor for inválido
    }

    // Define o desconto com base no valor da compra
    if (valorCompra >= 500) {
        desconto = 0.2; // 20% de desconto
    } else if (valorCompra >= 200) {
        desconto = 0.1; // 10% de desconto
    }   

    // Calcula o valor final considerando o desconto
    double valorFinal = valorCompra - (valorCompra * desconto);

    // Exibe o valor final da compra
    cout << "Valor final após o desconto: R$ " << valorFinal << endl;
}
void verificacaoTriangulo() {
    int lado1, lado2, lado3;

    // Solicita os lados do triângulo
    cout << "Digite o comprimento do primeiro lado: ";
    cin >> lado1;
    cout << "Digite o comprimento do segundo lado: ";
    cin >> lado2;
    cout << "Digite o comprimento do terceiro lado: ";
    cin >> lado3;

    // Verifica se os lados formam um triângulo válido
    if (lado1 + lado2 > lado3 && lado1 + lado3 > lado2 && lado2 + lado3 > lado1) {
        cout << "É um triângulo válido" << endl;
    } else {
        cout << "Não é um triângulo válido" << endl;
    }
}
void classificacaoTemperatura() {
    double temperatura;

    // Solicita a temperatura em graus Celsius
    cout << "Digite a temperatura (em graus Celsius): ";
    cin >> temperatura;

    // Classifica a temperatura
    if (temperatura > 30) {
        cout << "Muito quente" << endl;
    } else if (temperatura >= 15) {
        cout << "Temperatura agradável" << endl;
    } else {
        cout << "Frio" << endl;
    }
}
void tabuadaNumero() {
    int numero;

    // Solicita o número ao usuário
    cout << "Digite um numero: ";
    cin >> numero;

    // Exibe a tabuada de 1 a 10
    cout << "Tabuada de " << numero << ":" << endl;
    for (int i = 1; i <= 10; i++) {
        cout << numero << " x " << i << " = " << numero * i << endl;
    }
}
void somaNPrimeirosNaturais() {
    int N;
    int soma = 0;

    // Solicita o número N ao usuário
    cout << "Digite um número N: ";
    cin >> N;

    if (N < 0) {
        cout << "Por favor, digite um número natural (não negativo)." << endl;
        return; // Encerra a função se o número for negativo
    }

    // Calcula a soma dos primeiros N números naturais
    for (int i = 1; i <= N; i++) {
        soma += i;
    }

    // Exibe a soma
    cout << "A soma dos primeiros " << N << " números naturais é: " << soma << endl;
}
void impressaoNumerosImpares() {
    int N;

    // Solicita o número N ao usuário
    cout << "Digite um número N: ";
    cin >> N;

    cout << "Números ímpares de 1 até " << N << ":" << endl;
    if (N >= 1) {
        // Exibe todos os números ímpares de 1 até N (para N positivo)
        for (int i = 1; i <= N; i++) {
            if (i % 2 != 0) {  // Verifica se o número é ímpar
                cout << i << " ";
            }
        }
    } else {
        // Exibe todos os números ímpares de 1 até N (para N negativo)
        for (int i = 1; i >= N; i--) {
            if (i % 2 != 0) {  // Verifica se o número é ímpar
                cout << i << " ";
            }
        }
    }
    cout << endl;
}
void fatorialNumero() {
    int N;
    long long fatorial = 1;  // Usamos long long para evitar overflow

    // Solicita o número N ao usuário
    cout << "Digite um numero inteiro positivo: ";
    cin >> N;

    // Verifica se o número é negativo
    if (N < 0) {
        cout << "Fatorial não existe para números negativos." << endl;
    } else {
        // Calcula o fatorial
        for (int i = 1; i <= N; i++) {
            fatorial *= i;  // Multiplica cada número de 1 até N
        }

        // Exibe o resultado
        cout << "O fatorial de " << N << " é: " << fatorial << endl;
    }
}
void serieFibonacci() {
    int N;
    
    // Solicita o número N ao usuário
    cout << "Digite o valor de N: ";
    cin >> N;

    // Verifica se N é válido
    if (N <= 0) {
        cout << "Por favor, insira um número inteiro positivo para N." << endl;
    } else {
        // Primeiros dois termos da sequência
        long long a = 0, b = 1;

        cout << "Sequência de Fibonacci até o " << N << "º termo:" << endl;
        
        // Exibe o primeiro termo
        if (N >= 1) cout << a << " ";
        
        // Exibe o segundo termo
        if (N >= 2) cout << b << " ";

        // Calcula e exibe os termos seguintes
        for (int i = 3; i <= N; i++) {
            long long proximo = a + b;
            cout << proximo << " ";
            a = b;
            b = proximo;
        }

        cout << endl;
    }
}
void adivinhacaoNumero() {
    // Inicializa o gerador de números aleatórios
    srand(time(0));
    
    // Gera um número aleatório entre 1 e 100
    int numeroGerado = rand() % 100 + 1;
    int palpite;

    cout << "Tente adivinhar o número gerado (entre 1 e 100): ";

    // Loop para permitir ao usuário tentar até acertar
    while (true) {
        cin >> palpite;

        // Verifica o palpite do usuário
        if (palpite < numeroGerado) {
            cout << "Tente um numero maior: ";
        } else if (palpite > numeroGerado) {
            cout << "Tente um numero menor: ";
        } else {
            cout << "Parabéns! Você acertou!" << endl;
            break;  // Sai do loop quando o palpite estiver correto
        }
    }
}
void validacaoSenha() {
    string senha;
    const string senhaCorreta = "1234";  // Defina a senha correta

    cout << "Digite a senha: ";

    // Loop para validar a senha
    while (true) {
        cin >> senha;

        // Verifica se a senha digitada está correta
        if (senha == senhaCorreta) {
            cout << "Acesso permitido" << endl;
            break;  // Sai do loop quando a senha estiver correta
        } else {
            cout << "Senha incorreta, tente novamente: ";
        }
    }
}
void mediaNotas() {
    double nota, somaNotas = 0.0;
    int contador = 0;

    cout << "Digite as notas (insira um número negativo para encerrar):" << endl;

    // Loop para inserir várias notas até o número negativo
    while (true) {
        cin >> nota;

        // Verifica se a nota é negativa para encerrar
        if (nota < 0) {
            break;  // Sai do loop se a nota for negativa
        }

        somaNotas += nota;  // Soma a nota
        contador++;  // Conta o número de notas inseridas
    }

    // Verifica se o contador é maior que 0 para evitar divisão por zero
    if (contador > 0) {
        double media = somaNotas / contador;  // Calcula a média
        cout << "A média das notas é: " << media << endl;
    } else {
        cout << "Nenhuma nota foi inserida." << endl;
    }
}
void calculadoraSimples() {
    double num1, num2;
    char operacao;

    // Solicita ao usuário que insira dois números e a operação
    cout << "Digite o primeiro número: ";
    cin >> num1;

    cout << "Digite a operação (+, -, *, /): ";
    cin >> operacao;

    cout << "Digite o segundo número: ";
    cin >> num2;
    
    // Realiza a operação com switch
    switch (operacao) {
        case '+':
            cout << "Resultado: " << num1 + num2 << endl;
            break;
        case '-':
            cout << "Resultado: " << num1 - num2 << endl;
            break;
        case '*':
            cout << "Resultado: " << num1 * num2 << endl;
            break;
        case '/':
            if (num2 != 0) {
                cout << "Resultado: " << num1 / num2 << endl;
            } else {
                cout << "Erro! Divisão por zero." << endl;
            }
            break;
        default:
            cout << "Operação inválida!" << endl;
    }
}
void conversorMoedas() {
    double valor, valorConvertido;
    int opcao;

    // Definindo taxas de conversão como constantes globais para melhor manutenção
    const double TAXA_DOLAR = 5.0;
    const double TAXA_EURO = 5.5;
    const double TAXA_LIBRA = 6.0;

    // Exibe as opções de conversão
    cout << "Escolha uma opção de conversão de moeda:" << endl;
    cout << "1 - Dólar para Real" << endl;
    cout << "2 - Euro para Real" << endl;
    cout << "3 - Libra para Real" << endl;
    cout << "Digite a opção escolhida: ";
    cin >> opcao;

    // Verifica a validade da opção antes de solicitar o valor a ser convertido
    if (opcao < 1 || opcao > 3) {
        cout << "Opção inválida! Tente novamente." << endl;
        return; // Encerra a função se a opção for inválida
    }

    // Solicita o valor a ser convertido
    cout << "Digite o valor a ser convertido: ";
    cin >> valor;

    // Realiza a conversão com switch
    switch (opcao) {
        case 1:
            valorConvertido = valor * TAXA_DOLAR;
            break;
        case 2:
            valorConvertido = valor * TAXA_EURO;
            break;
        case 3:
            valorConvertido = valor * TAXA_LIBRA;
            break;
    }

    cout << "Valor convertido: " << valorConvertido << " Reais" << endl;
}
void somaElementosArray() {
    int N;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    if (N < 0) {
        cout << "Número inválido de elementos." << endl;
        return;
    }

    vector<int> array(N);  // Utilizando vector para evitar VLA
    int soma = 0;  // Variável para armazenar a soma dos elementos

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
        soma += array[i];  // Adiciona o valor do elemento à soma
    }

    // Exibe a soma dos elementos
    cout << "A soma dos elementos do array é: " << soma << endl;
}
void maiorMenorElementoArray() {
    int N;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    if (N <= 0) {
        cout << "Número de elementos inválido." << endl;
        return;
    }

    int array[N];  // Declara o array de tamanho N

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
    }

    // Inicializa o maior e menor valor com o primeiro elemento do array
    int maior = array[0];
    int menor = array[0];

    // Determina o maior e o menor elemento
    for (int i = 1; i < N; i++) {
        if (array[i] > maior) {
            maior = array[i];
        }
        if (array[i] < menor) {
            menor = array[i];
        }
    }

    // Exibe o maior e o menor elemento do array
    cout << "O maior número do array é: " << maior << endl;
    cout << "O menor número do array é: " << menor << endl;
}
void contagemParesImpares() {
    int N;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    int array[N];  // Declara o array de tamanho N
    int pares = 0, impares = 0;  // Variáveis para contar pares e ímpares

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
        
        // Verifica se o número é par ou ímpar
        if (array[i] % 2 == 0) {
            pares++;  // Incrementa o contador de pares
        } else {
            impares++;  // Incrementa o contador de ímpares
        }
    }

    // Exibe a quantidade de números pares e ímpares
    cout << "Quantidade de números pares: " << pares << endl;
    cout << "Quantidade de números ímpares: " << impares << endl;
}
void inversaoArray() {
    int N;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    int array[N];  // Declara o array de tamanho N

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
    }

    // Imprime os elementos na ordem inversa
    cout << "Elementos na ordem inversa: " << endl;
    for (int i = N - 1; i >= 0; i--) {
        cout << array[i] << " ";
    }
    cout << endl;
}
void mediaElementosArray() {
    int N;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    int array[N];  // Declara o array de tamanho N
    int soma = 0;  // Variável para armazenar a soma dos elementos

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
        soma += array[i];  // Adiciona o valor do elemento à soma
    }

    // Calcula a média
    double media = soma / (double)N;  // Converte N para double implicitamente na divisão

    // Exibe a média dos elementos
    cout << "A média dos elementos do array é: " << media << endl;
}
void buscaElementoArray() {
    int N, X;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    int array[N];  // Declara o array de tamanho N

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
    }

    // Solicita o número X a ser buscado
    cout << "Digite o número X a ser buscado: ";
    cin >> X;

    // Busca pelo número X no array
    bool encontrado = false;
    for (int i = 0; i < N; i++) {
        if (array[i] == X) {
            cout << "Elemento encontrado na posição: " << i << endl;
            encontrado = true;
            break;  // Sai do loop ao encontrar o elemento
        }
    }

    // Se o elemento não for encontrado
    if (!encontrado) {
        cout << "Elemento não encontrado" << endl;
    }
}
void frequenciaElementoArray() {
    int N, X;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    int array[N];  // Declara o array de tamanho N

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
    }

    // Solicita o número X a ser contado
    cout << "Digite o número X a ser contado: ";
    cin >> X;

    // Conta quantas vezes X aparece no array
    int contador = 0;
    for (int i = 0; i < N; i++) {
        if (array[i] == X) {
            contador++;  // Incrementa o contador quando X é encontrado
        }
    }

    // Exibe o número de vezes que X aparece no array
    cout << "O número " << X << " aparece " << contador << " vezes no array." << endl;
}
void ordenacaoBubbleSort() {
    int N;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    vector<int> array(N); // Utilizando vector para evitar VLA

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
    }

    // Algoritmo Bubble Sort otimizado
    bool trocou;
    for (int i = 0; i < N - 1; i++) {
        trocou = false;
        for (int j = 0; j < N - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                swap(array[j], array[j + 1]);
                trocou = true;
            }
        }
        if (!trocou) break;  // Para se não houver trocas
    }

    // Exibe o array ordenado
    cout << "Array ordenado em ordem crescente: " << endl;
    for (int i = 0; i < N; i++) {
        cout << array[i] << " ";
    }
    cout << endl;
}
void mesclarArraysOrdenados() {
    int N, M;

    // Solicita o tamanho dos dois arrays
    cout << "Digite o número de elementos do primeiro array (N): ";
    cin >> N;
    cout << "Digite o número de elementos do segundo array (M): ";
    cin >> M;

    int array1[N], array2[M], mergedArray[N + M];

    // Solicita os elementos do primeiro array (ordenado)
    cout << "Digite os " << N << " elementos do primeiro array (ordenado): " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array1[i];
    }

    // Solicita os elementos do segundo array (ordenado)
    cout << "Digite os " << M << " elementos do segundo array (ordenado): " << endl;
    for (int i = 0; i < M; i++) {
        cin >> array2[i];
    }

    // Mescla os dois arrays ordenados
    int i = 0, j = 0, k = 0;
    while (i < N && j < M) {
        if (array1[i] < array2[j]) {
            mergedArray[k++] = array1[i++];
        } else {
            mergedArray[k++] = array2[j++];
        }
    }

    // Adiciona os elementos restantes do array1, se houver
    while (i < N) {
        mergedArray[k++] = array1[i++];
    }

    // Adiciona os elementos restantes do array2, se houver
    while (j < M) {
        mergedArray[k++] = array2[j++];
    }

    // Exibe o array mesclado
    cout << "Array mesclado ordenado: " << endl;
    for (int i = 0; i < N + M; i++) {
        cout << mergedArray[i] << " ";
    }
    cout << endl;
}
void removerDuplicatasArray() {
    int N;

    // Solicita o tamanho do array
    cout << "Digite o número de elementos do array: ";
    cin >> N;

    int array[N], semDuplicatas[N];  // Declara o array e o array sem duplicatas
    int novoTamanho = 0;  // Variável para controlar o tamanho do array sem duplicatas

    // Solicita os elementos do array
    cout << "Digite os " << N << " elementos do array: " << endl;
    for (int i = 0; i < N; i++) {
        cin >> array[i];
    }

    // Percorre o array e adiciona os elementos no array semDuplicatas, se não forem duplicados
    for (int i = 0; i < N; i++) {
        bool isDuplicado = false;

        // Verifica se o elemento já existe no array semDuplicatas
        for (int j = 0; j < novoTamanho; j++) {
            if (array[i] == semDuplicatas[j]) {
                isDuplicado = true;  // Se for duplicado, marca como true
                break;
            }
        }

        // Se não for duplicado, adiciona no array semDuplicatas
        if (!isDuplicado) {
            semDuplicatas[novoTamanho] = array[i];
            novoTamanho++;  // Aumenta o tamanho do array semDuplicatas
        }
    }

    // Exibe o array sem duplicatas
    cout << "Array sem duplicatas: ";
    for (int i = 0; i < novoTamanho; i++) {
        cout << semDuplicatas[i] << " ";
    }
    cout << endl;
}

// Estrutura para armazenar opções e funções associadas
struct OpcaoMenu {
    string descricao;
    void (*funcao)();
};

// Dicionário que mapeia os números do menu para suas descrições e funções correspondentes
map<int, OpcaoMenu> opcoes = {
    {1, {"Verificar Par ou Ímpar", verificarParImpar}}, {2, {"Verificar Maioridade", verificarMaioridade}},
    {3, {"Maior de Dois Números", maiorDeDoisNumeros}}, {4, {"Classificação de Notas", classificacaoNotas}},
    {5, {"Número Positivo, Negativo ou Zero", numeroPositivoNegativoZero}}, {6, {"Verificação de Ano Bissexto", verificacaoAnoBissexto}},
    {7, {"Acesso ao Sistema", acessoAoSistema}}, {8, {"Cálculo de Desconto", calculoDesconto}},
    {9, {"Verificação de Triângulo", verificacaoTriangulo}}, {10, {"Classificação de Temperatura", classificacaoTemperatura}},
    {11, {"Tabuada de um Número", tabuadaNumero}}, {12, {"Soma dos N primeiros números naturais", somaNPrimeirosNaturais}},
    {13, {"Impressão de Números Ímpares", impressaoNumerosImpares}}, {14, {"Fatorial de um Número", fatorialNumero}},
    {15, {"Série de Fibonacci", serieFibonacci}}, {16, {"Adivinhação de Número", adivinhacaoNumero}},
    {17, {"Validação de Senha", validacaoSenha}}, {18, {"Média de Notas", mediaNotas}},
    {19, {"Calculadora Simples", calculadoraSimples}}, {20, {"Conversor de Moedas", conversorMoedas}},
    {21, {"Soma dos Elementos de um Array", somaElementosArray}}, {22, {"Maior e Menor Elemento de um Array", maiorMenorElementoArray}},
    {23, {"Contagem de Números Pares e Ímpares", contagemParesImpares}}, {24, {"Inversão de um Array", inversaoArray}},
    {25, {"Média dos Elementos de um Array", mediaElementosArray}}, {26, {"Busca de um Elemento em um Array", buscaElementoArray}},
    {27, {"Frequência de um Elemento em um Array", frequenciaElementoArray}}, {28, {"Ordenação Simples (Bubble Sort)", ordenacaoBubbleSort}},
    {29, {"Mesclar Dois Arrays Ordenados", mesclarArraysOrdenados}}, {30, {"Remover Duplicatas de um Array", removerDuplicatasArray}}
};

// Exibe o menu e processa a escolha do usuário
void menu() {
    int opcao;
    do {
        cout << "============================================\nEscolha uma opção:\n";
        for (const auto& item : opcoes) {
            cout << item.first << ". " << item.second.descricao << endl;
        }
        cout << "0. Sair\n============================================";
        cout << "\nOpção: ";
        cin >> opcao;

        if (opcao == 0) {
            cout << "Saindo...\n";
            break;
        }

        // Verifica se a opção existe no mapa antes de executar
        if (opcoes.count(opcao)) {
            opcoes[opcao].funcao();  // Executa a função correspondente
            cout << "\nPressione Enter para continuar...";
            cin.ignore();  // Ignora o '\n' deixado no buffer pelo último cin
            cin.get();  // Aguarda o usuário pressionar Enter
        } else {
            cout << "Opção inválida!\n";
        }
    } while (opcao != 0);
}

// Função principal
int main() {
    menu();
    return 0;
}