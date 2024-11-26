#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <DHT.h>

// Definições do sensor DHT
#define DHTPIN 2 // Pino conectado ao DHT-11
#define DHTTYPE DHT11 // Tipo do sensor (DHT-11)

// Credenciais do Blynk
#define BLYNK_TEMPLATE_ID "YourTemplateID" // Substituir com o ID do template
#define BLYNK_DEVICE_NAME "YourDeviceName" // Substituir com o nome do dispositivo
#define BLYNK_AUTH_TOKEN "YourAuthToken"   // Substituir com o token gerado pelo Blynk

// Credenciais WiFi
char ssid[] = "YourSSID";       // Nome da rede WiFi
char pass[] = "YourPassword";   // Senha da rede WiFi

DHT dht(DHTPIN, DHTTYPE); // Inicializa o sensor DHT

void setup() {
    // Configura a conexão com o Blynk e inicializa o sensor
    Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);
    dht.begin();
}

void loop() {
    Blynk.run(); // Mantém a conexão ativa com o servidor Blynk

    // Lê a temperatura do sensor e envia para o Blynk
    float temperature = dht.readTemperature();
    Blynk.virtualWrite(V6, temperature); // Envia a temperatura para o Virtual Pin V6
}