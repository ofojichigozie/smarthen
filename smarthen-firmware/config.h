#pragma once

// ---------------------------------------------------------------------------
// config.h — Smarthen Firmware Configuration
// ---------------------------------------------------------------------------

// --- WiFi -------------------------------------------------------------------
#define WIFI_SSID       "Wirespot"
#define WIFI_PASSWORD   "W12345678T"

// --- Mode -------------------------------------------------------------------
// Set to true for local development (HTTP), false for production (HTTPS)
#define DEV_MODE        false

// --- Backend ----------------------------------------------------------------
#if DEV_MODE
  #define API_BASE_URL  "http://192.168.0.170:5000/api"
#else
  #define API_BASE_URL  "https://your-production-url.com/api"
#endif

#define HARDWARE_API_KEY "4pQ2wK8mN5zR7vX3jG1hF9dC6bS0eT2v"

// --- Endpoints (must match smarthen-backend routes) -------------------------
#define API_SEND_SENSOR_DATA      API_BASE_URL "/readings/sensor-data"
#define API_GET_CONFIG            API_BASE_URL "/config"
#define API_GET_PENDING_COMMANDS  API_BASE_URL "/commands/pending"
#define API_EXECUTE_COMMAND       API_BASE_URL "/commands/execute"

// --- Timing (milliseconds) --------------------------------------------------
#define SEND_INTERVAL_MS      15000UL   // Send sensor data every 15s
#define CONFIG_REFRESH_MS     60000UL   // Refresh config every 60s
#define COMMAND_POLL_MS       10000UL   // Poll for commands every 10s
#define SCHEDULE_CHECK_MS     30000UL   // Check feeding schedule every 30s

// --- Hardware Pins ----------------------------------------------------------
#define LED_PIN             2             // On-board LED (GPIO 2 on most ESP32 DevKit boards, active LOW)
#define DHT_PIN             4             // DHT22 data pin
#define MQ2_PIN             34            // MQ2 analog input
#define FAN_RELAY_PIN       26            // Relay channel 1 (fan)
#define BULB_RELAY_PIN      27            // Relay channel 2 (bulb)
#define SERVO_PIN           13            // SG90 servo signal
#define BUZZER_PIN          14            // Buzzer (active HIGH)

// --- Defaults (overridden by backend config) --------------------------------
#define DEFAULT_TEMPERATURE_MIN    18.0
#define DEFAULT_TEMPERATURE_MAX    30.0
#define DEFAULT_HUMIDITY_MIN       40.0
#define DEFAULT_HUMIDITY_MAX       70.0
#define DEFAULT_GAS_THRESHOLD      200
#define DEFAULT_FAN_AUTO_MODE      true
#define DEFAULT_BULB_AUTO_MODE     true
#define DEFAULT_BUZZER_ENABLED     true

// --- Feeding Schedule Defaults (overridden by backend) ----------------------
#define DEFAULT_FEEDING_TIMES  "02:00,06:00,09:00,15:00"

// --- NTP --------------------------------------------------------------------
#define NTP_SERVER          "pool.ntp.org"
#define TIMEZONE_OFFSET     3600          // GMT+1 (Nigeria)