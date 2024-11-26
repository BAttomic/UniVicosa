#define BLYNK_TEMPLATE_ID "YourTemplateID" // Substituir com o ID do template no Blynk
#define BLYNK_DEVICE_NAME "YourDeviceName" // Substituir com o nome do dispositivo no Blynk
#define BLYNK_AUTH_TOKEN "YourAuthToken"   // Substituir com o token de autenticação gerado pelo Blynk

#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>

// Credenciais da rede WiFi
char ssid[] = "YourSSID";       // Nome da rede WiFi
char pass[] = "YourPassword";   // Senha da rede WiFi

void setup() {
    // Inicializa a conexão com o Blynk e a rede WiFi
    Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);
    pinMode(D1, OUTPUT); // Configura o pino D1 como saída para o LED
}

void loop() {
    Blynk.run(); // Mantém a conexão ativa com o servidor Blynk
}
