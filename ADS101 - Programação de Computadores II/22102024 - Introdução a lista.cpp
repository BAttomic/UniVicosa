#include <iostream>

using namespace std;

struct Node {
    int data;
    Node* next;
};

// Função para inserir um elemento no início da lista
void insertAtBeginning(Node** head, int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = *head;
    *head = newNode;
}

// Função para exibir a lista
void printList(Node* head) {
    Node* temp = head;
    while (temp != nullptr) {
        cout << temp->data << " -> ";
        temp = temp->next;
    }
    cout << "null" << endl;
}

int main() {
    Node* head = nullptr;

    insertAtBeginning(&head, 10);
    insertAtBeginning(&head, 20);
    insertAtBeginning(&head, 30);

    printList(head);

    return 0;
}
