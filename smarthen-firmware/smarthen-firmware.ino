#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include "config.h"

#if !DEV_MODE
#include <WiFiClientSecure.h>
#endif

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------

// Sensors
DHT dht(DHT_PIN, DHT22);

// Servo
Servo feedServo;

// NTP
WiFiUDP ntpUDP;
NTPClient ntpTimeClient(ntpUDP, NTP_SERVER, TIMEZONE_OFFSET, 60000);

// Secure client for HTTPS (production only)
#if !DEV_MODE
WiFiClientSecure secureClient;
#endif

// System state
unsigned long lastSendTime = 0;
unsigned long lastConfigRefreshTime = 0;
unsigned long lastCommandPollTime = 0;
unsigned long lastScheduleCheckTime = 0;

// Config (synced from backend)
struct {
  float temperatureMin = DEFAULT_TEMPERATURE_MIN;
  float temperatureMax = DEFAULT_TEMPERATURE_MAX;
  float humidityMin = DEFAULT_HUMIDITY_MIN;
  float humidityMax = DEFAULT_HUMIDITY_MAX;
  int gasThreshold = DEFAULT_GAS_THRESHOLD;
  bool fanAutoMode = DEFAULT_FAN_AUTO_MODE;
  bool bulbAutoMode = DEFAULT_BULB_AUTO_MODE;
  bool buzzerEnabled = DEFAULT_BUZZER_ENABLED;
  String feedingTimes = DEFAULT_FEEDING_TIMES;
} systemConfig;

// Current readings
struct {
  float temperature = 0;
  float humidity = 0;
  int gasLevel = 0;
  bool fanState = false;
  bool bulbState = false;
  bool buzzerState = false;
} currentReadings;

// ---------------------------------------------------------------------------
// LED Helpers
// ---------------------------------------------------------------------------

void setLed(bool state) {
  digitalWrite(LED_PIN, state ? LOW : HIGH);  // Active LOW
}

void blinkLed(int count, int delayMs) {
  for (int i = 0; i < count; i++) {
    setLed(false);
    delay(delayMs);
    setLed(true);
    delay(delayMs);
  }
  setLed(true);
}

// ---------------------------------------------------------------------------
// WiFi
// ---------------------------------------------------------------------------

void setupWiFi() {
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    blinkLed(1, 250);
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  Serial.print("[WiFi] Connected. IP: ");
  Serial.println(WiFi.localIP());
  setLed(true);
}

void reconnectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("[WiFi] Connection lost. Reconnecting...");
  WiFi.disconnect();
  delay(1000);
  setupWiFi();
}

// ---------------------------------------------------------------------------
// NTP
// ---------------------------------------------------------------------------

void setupNTP() {
  ntpTimeClient.begin();
  ntpTimeClient.update();
  Serial.print("[NTP] Time: ");
  Serial.println(ntpTimeClient.getFormattedTime());
}

String getCurrentTime() {
  ntpTimeClient.update();
  return ntpTimeClient.getFormattedTime();  // "HH:MM:SS"
}

String getCurrentHourMinute() {
  String fullTime = getCurrentTime();
  return fullTime.substring(0, 5);  // "HH:MM"
}

// ---------------------------------------------------------------------------
// Sensor Reading
// ---------------------------------------------------------------------------

void readSensors() {
  currentReadings.temperature = dht.readTemperature();
  currentReadings.humidity = dht.readHumidity();
  currentReadings.gasLevel = analogRead(MQ2_PIN);

  if (isnan(currentReadings.temperature)) currentReadings.temperature = 0;
  if (isnan(currentReadings.humidity)) currentReadings.humidity = 0;

  Serial.print("[Sensor] T: ");
  Serial.print(currentReadings.temperature);
  Serial.print("°C, H: ");
  Serial.print(currentReadings.humidity);
  Serial.print("%, Gas: ");
  Serial.println(currentReadings.gasLevel);
}

// ---------------------------------------------------------------------------
// Actuator Control
// ---------------------------------------------------------------------------

void setFan(bool state) {
  currentReadings.fanState = state;
  digitalWrite(FAN_RELAY_PIN, state ? HIGH : LOW);
  Serial.print("[Actuator] Fan: ");
  Serial.println(state ? "ON" : "OFF");
}

void setBulb(bool state) {
  currentReadings.bulbState = state;
  digitalWrite(BULB_RELAY_PIN, state ? HIGH : LOW);
  Serial.print("[Actuator] Bulb: ");
  Serial.println(state ? "ON" : "OFF");
}

void setBuzzer(bool state) {
  currentReadings.buzzerState = state;
  digitalWrite(BUZZER_PIN, state ? HIGH : LOW);
  Serial.print("[Actuator] Buzzer: ");
  Serial.println(state ? "ON" : "OFF");
}

void dispenseFeed() {
  Serial.println("[Actuator] Dispensing feed...");
  feedServo.write(20);
  delay(1500);
  feedServo.write(90);
  Serial.println("[Actuator] Feed dispensed.");
}

// ---------------------------------------------------------------------------
// Automation Logic
// ---------------------------------------------------------------------------

void applyAutomation() {
  // Fan control
  if (systemConfig.fanAutoMode) {
    bool fanShouldBeOn = (currentReadings.temperature > systemConfig.temperatureMax) ||
                         (currentReadings.humidity > systemConfig.humidityMax);
    if (fanShouldBeOn != currentReadings.fanState) {
      setFan(fanShouldBeOn);
    }
  }

  // Bulb control
  if (systemConfig.bulbAutoMode) {
    bool bulbShouldBeOn = currentReadings.temperature < systemConfig.temperatureMin;
    if (bulbShouldBeOn != currentReadings.bulbState) {
      setBulb(bulbShouldBeOn);
    }
  }

  // Buzzer (gas alert)
  if (systemConfig.buzzerEnabled) {
    bool buzzerShouldBeOn = currentReadings.gasLevel > systemConfig.gasThreshold;
    if (buzzerShouldBeOn != currentReadings.buzzerState) {
      setBuzzer(buzzerShouldBeOn);
    }
  }
}

// ---------------------------------------------------------------------------
// Feeding Schedule
// ---------------------------------------------------------------------------

void checkFeedingScheduleAndDispense() {
  String currentHM = getCurrentHourMinute();

  // Parse feed times from config (comma-separated)
  int start = 0;
  int end = systemConfig.feedingTimes.indexOf(',');
  while (end >= 0) {
    String time = systemConfig.feedingTimes.substring(start, end);
    time.trim();
    if (time == currentHM) {
      dispenseFeed();
      return;
    }
    start = end + 1;
    end = systemConfig.feedingTimes.indexOf(',', start);
  }
  String lastTime = systemConfig.feedingTimes.substring(start);
  lastTime.trim();
  if (lastTime == currentHM) {
    dispenseFeed();
  }
}

// ---------------------------------------------------------------------------
// Backend Communication
// ---------------------------------------------------------------------------

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.println("[HTTP] Sending sensor data...");

  HTTPClient http;
  StaticJsonDocument<256> doc;

  doc["temperature"] = currentReadings.temperature;
  doc["humidity"] = currentReadings.humidity;
  doc["gasLevel"] = currentReadings.gasLevel;
  doc["fanState"] = currentReadings.fanState;
  doc["bulbState"] = currentReadings.bulbState;
  doc["buzzerState"] = currentReadings.buzzerState;

  char payload[256];
  serializeJson(doc, payload);

#if DEV_MODE
  http.begin(API_SEND_SENSOR_DATA);
#else
  secureClient.setInsecure();
  http.begin(secureClient, API_SEND_SENSOR_DATA);
#endif
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", HARDWARE_API_KEY);

  blinkLed(2, 120);
  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print("[HTTP] Sensor data sent: ");
    Serial.print(httpCode);
    Serial.print(" | T:");
    Serial.print(currentReadings.temperature);
    Serial.print("C H:");
    Serial.print(currentReadings.humidity);
    Serial.print("% Gas:");
    Serial.print(currentReadings.gasLevel);
    Serial.print(" Fan:");
    Serial.print(currentReadings.fanState ? "ON" : "OFF");
    Serial.print(" Bulb:");
    Serial.print(currentReadings.bulbState ? "ON" : "OFF");
    Serial.print(" Buzzer:");
    Serial.println(currentReadings.buzzerState ? "ON" : "OFF");

    if (httpCode == 200 || httpCode == 201) {
      blinkLed(3, 250);
    } else {
      blinkLed(4, 250);
    }
  } else {
    Serial.print("[HTTP] POST failed: ");
    Serial.println(http.errorToString(httpCode));
    blinkLed(4, 250);
  }

  http.end();
}

void fetchConfig() {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.println("[Config] Fetching from server...");

  HTTPClient http;
#if DEV_MODE
  http.begin(API_GET_CONFIG);
#else
  secureClient.setInsecure();
  http.begin(secureClient, API_GET_CONFIG);
#endif
  http.addHeader("X-API-Key", HARDWARE_API_KEY);

  int httpCode = http.GET();

  if (httpCode == 200) {
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, http.getString());

    if (!error && doc.containsKey("data")) {
      JsonObject data = doc["data"];

      systemConfig.temperatureMin = data["temperatureMin"] | DEFAULT_TEMPERATURE_MIN;
      systemConfig.temperatureMax = data["temperatureMax"] | DEFAULT_TEMPERATURE_MAX;
      systemConfig.humidityMin = data["humidityMin"] | DEFAULT_HUMIDITY_MIN;
      systemConfig.humidityMax = data["humidityMax"] | DEFAULT_HUMIDITY_MAX;
      systemConfig.gasThreshold = data["gasThreshold"] | DEFAULT_GAS_THRESHOLD;
      systemConfig.fanAutoMode = data["fanAutoMode"] | DEFAULT_FAN_AUTO_MODE;
      systemConfig.bulbAutoMode = data["bulbAutoMode"] | DEFAULT_BULB_AUTO_MODE;
      systemConfig.buzzerEnabled = data["buzzerEnabled"] | DEFAULT_BUZZER_ENABLED;

      if (data.containsKey("feedingTimes") && data["feedingTimes"].is<JsonArray>()) {
        systemConfig.feedingTimes = "";
        JsonArray times = data["feedingTimes"].as<JsonArray>();
        for (size_t i = 0; i < times.size(); i++) {
          if (i > 0) systemConfig.feedingTimes += ",";
          systemConfig.feedingTimes += times[i].as<String>();
        }
      }

      Serial.print("[Config] Updated: Tmin=");
      Serial.print(systemConfig.temperatureMin);
      Serial.print(" Tmax=");
      Serial.print(systemConfig.temperatureMax);
      Serial.print(" Hmin=");
      Serial.print(systemConfig.humidityMin);
      Serial.print(" Hmax=");
      Serial.print(systemConfig.humidityMax);
      Serial.print(" GasThr=");
      Serial.print(systemConfig.gasThreshold);
      Serial.print(" FanAuto=");
      Serial.print(systemConfig.fanAutoMode ? "true" : "false");
      Serial.print(" BulbAuto=");
      Serial.print(systemConfig.bulbAutoMode ? "true" : "false");
      Serial.print(" Buzzer=");
      Serial.print(systemConfig.buzzerEnabled ? "true" : "false");
      Serial.print(" FeedTimes=");
      Serial.println(systemConfig.feedingTimes);
    } else {
      Serial.println("[Config] Parse failed");
    }
  } else {
    Serial.print("[Config] Fetch failed: ");
    Serial.println(httpCode);
  }

  http.end();
}

void fetchAndExecuteCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.println("[Commands] Polling for pending commands...");

  HTTPClient http;
#if DEV_MODE
  http.begin(API_GET_PENDING_COMMANDS);
#else
  secureClient.setInsecure();
  http.begin(secureClient, API_GET_PENDING_COMMANDS);
#endif
  http.addHeader("X-API-Key", HARDWARE_API_KEY);

  int httpCode = http.GET();

  if (httpCode == 200) {
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, http.getString());

    if (!error && doc.containsKey("data")) {
      JsonArray commands = doc["data"].as<JsonArray>();

      if (commands.size() == 0) {
        Serial.println("[Commands] No pending commands");
      } else {
        Serial.print("[Commands] Received ");
        Serial.print(commands.size());
        Serial.println(" command(s)");

        for (JsonObject cmd : commands) {
          String command = cmd["command"];
          String id = cmd["_id"];

          Serial.print("[Command] Executing: ");
          Serial.println(command);

          bool executed = false;

          if (command == "fan_on") { setFan(true); executed = true; }
          else if (command == "fan_off") { setFan(false); executed = true; }
          else if (command == "bulb_on") { setBulb(true); executed = true; }
          else if (command == "bulb_off") { setBulb(false); executed = true; }
          else if (command == "feed_dispense") { dispenseFeed(); executed = true; }

          if (executed) {
            updateCommandStatus(id, "executed");
          }
        }
      }
    } else {
      Serial.println("[Commands] Parse failed");
    }
  } else {
    Serial.print("[Commands] Fetch failed: ");
    Serial.println(httpCode);
  }

  http.end();
}

void updateCommandStatus(String id, String status) {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.print("[Command] Updating status: ");
  Serial.print(id);
  Serial.print(" -> ");
  Serial.println(status);

  HTTPClient http;
#if DEV_MODE
  http.begin(API_EXECUTE_COMMAND);
#else
  secureClient.setInsecure();
  http.begin(secureClient, API_EXECUTE_COMMAND);
#endif

  StaticJsonDocument<128> doc;
  doc["commandId"] = id;
  doc["status"] = status;

  char payload[128];
  serializeJson(doc, payload);

  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", HARDWARE_API_KEY);

  int httpCode = http.PUT(payload);

  if (httpCode == 200) {
    Serial.println("[Command] Status updated");
  } else {
    Serial.print("[Command] Status update failed: ");
    Serial.println(httpCode);
  }

  http.end();
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

void setup() {
  // Claim relay pins FIRST (before Serial/delay) to prevent floating GPIO
  // from briefly triggering the relays on boot.
  pinMode(FAN_RELAY_PIN, OUTPUT);
  pinMode(BULB_RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(FAN_RELAY_PIN, LOW);
  digitalWrite(BULB_RELAY_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.begin(115200);
  delay(500);

  pinMode(LED_PIN, OUTPUT);
  pinMode(MQ2_PIN, INPUT);

  setLed(false);

  // Init DHT
  dht.begin();

  // Init servo
  feedServo.attach(SERVO_PIN);
  feedServo.write(90);

  Serial.println("\n=== Smarthen Firmware Starting ===");

  setupWiFi();
  setupNTP();

  // Fetch initial config
  fetchConfig();

  setLed(true);
  Serial.println("[System] Ready.");
}

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------

void loop() {
  unsigned long now = millis();

  reconnectWiFi();

  // Read sensors at send interval
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    readSensors();
    applyAutomation();
    sendSensorData();
  }

  // Refresh config
  if (now - lastConfigRefreshTime >= CONFIG_REFRESH_MS) {
    lastConfigRefreshTime = now;
    fetchConfig();
  }

  // Poll for commands
  if (now - lastCommandPollTime >= COMMAND_POLL_MS) {
    lastCommandPollTime = now;
    fetchAndExecuteCommands();
  }

  // Check feeding schedule and dispense if due
  if (now - lastScheduleCheckTime >= SCHEDULE_CHECK_MS) {
    lastScheduleCheckTime = now;
    checkFeedingScheduleAndDispense();
  }

  delay(100);
}