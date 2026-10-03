# Smarthen Firmware

ESP32 firmware for the **Smarthen** smart poultry management system. It monitors environmental conditions in a poultry house, controls ventilation/heating, dispenses feed on schedule, and keeps the backend in sync over Wi-Fi.

## What is included

- ESP32-based firmware (tested on COM3 on Windows)
- Wi-Fi connectivity with auto-reconnect
- DHT22 temperature & humidity sensing
- MQ-2 gas/smoke detection
- Relay control for fan, bulb, and buzzer
- SG90 servo for automated feed dispensing
- NTP time sync for scheduled feeding
- HTTP communication with the Smarthen backend:
  - `POST /api/readings/sensor-data`
  - `GET /api/config`
  - `GET /api/commands/pending`
  - `PUT /api/commands/execute`
- Runtime configuration pulled from the backend

## Hardware overview

| Component | Pin | Notes |
|-----------|-----|-------|
| On-board LED | GPIO 2 | Active LOW (most ESP32 DevKit boards) |
| DHT22 | GPIO 4 | Temperature / humidity |
| MQ-2 | GPIO 34 | Analog gas/smoke input |
| Fan relay | GPIO 26 | Active HIGH |
| Bulb relay | GPIO 27 | Active HIGH |
| Servo | GPIO 13 | Feed dispensing |
| Buzzer | GPIO 14 | Active HIGH |

## Prerequisites

1. [Arduino CLI](https://arduino.github.io/arduino-cli/) installed and available in your PATH.
2. ESP32 board support installed (`esp32:esp32`).
3. The required Arduino libraries installed.
4. A USB cable connected to your ESP32 board.

### Required libraries

Install these via the Arduino Library Manager or `arduino-cli lib install`:

```powershell
arduino-cli lib install "ArduinoJson"
arduino-cli lib install "DHT sensor library"
arduino-cli lib install "ESP32Servo"
```

`WiFi`, `HTTPClient`, and `NTPClient` are bundled with the ESP32 core.

## 1) Install the required toolchain

Run these commands from the firmware folder:

```powershell
arduino-cli core update-index
arduino-cli core install esp32:esp32
```

Confirm the board is visible:

```powershell
arduino-cli board list
```

> On Windows, the ESP32 is typically listed on COM3 (adjust if your system uses a different port).

## 2) Configure your device

Edit [`config.h`](config.h) and update these values:

- `WIFI_SSID`
- `WIFI_PASSWORD`
- `DEV_MODE` (`true` for local HTTP development, `false` for HTTPS production)
- `API_BASE_URL` (set automatically by `DEV_MODE`, or override directly in `config.h`)
- `HARDWARE_API_KEY` (must match the value configured in the backend)

Example (development mode):

```cpp
#define WIFI_SSID        "YourWiFiName"
#define WIFI_PASSWORD    "YourWiFiPassword"
#define DEV_MODE         true
#define API_BASE_URL     "http://192.168.1.100/api"
#define HARDWARE_API_KEY "your-hardware-api-key"
```

When `DEV_MODE` is `false`, the firmware uses `WiFiClientSecure` with `setInsecure()` for HTTPS connections.

### Default thresholds

These are used until the device fetches config from the backend:

- Temperature min / max: `18.0°C` / `30.0°C`
- Humidity min / max: `40%` / `70%`
- Gas threshold: `200`
- Fan auto mode: `true`
- Bulb auto mode: `true`
- Buzzer enabled: `true`
- Feeding times: `"02:00,06:00,09:00,15:00"`

## 3) Compile the firmware

From the `smarthen-firmware` folder:

```powershell
arduino-cli compile --fqbn esp32:esp32:esp32 .
```

## 4) Upload the firmware to the ESP32

The example below uses COM3 on Windows. Replace it if your board uses a different port:

```powershell
arduino-cli upload -p COM3 --fqbn esp32:esp32:esp32 .
```

## 5) Open the serial monitor

To view debug output from the board at 115200 baud:

```powershell
arduino-cli monitor -p COM3 --fqbn esp32:esp32:esp32 --config baudrate=115200
```

You can stop the monitor with `Ctrl+C`.

## 6) Optional: use the Arduino IDE

If you prefer the Arduino IDE instead of the CLI:

1. Open [`smarthen-firmware.ino`](smarthen-firmware.ino) in the Arduino IDE.
2. Select Board: `ESP32 Dev Module`.
3. Select the correct COM port (e.g. COM3).
4. Click Verify and Upload.
5. Open Serial Monitor at 115200 baud.

## How it works

1. On startup the ESP32 connects to Wi-Fi and synchronizes time via NTP.
2. It fetches the latest configuration from the Smarthen backend.
3. Every **15 seconds** it reads the sensors, applies automation rules, and uploads readings.
4. Every **60 seconds** it refreshes configuration.
5. Every **5 seconds** it polls the backend for pending commands (`fan_on`, `fan_off`, `bulb_on`, `bulb_off`, `feed_dispense`).
6. Every **60 seconds** it checks the feeding schedule and dispenses feed if the current `HH:MM` matches.

### Automation rules

- **Fan:** turns on automatically when temperature > `temperatureMax` or humidity > `humidityMax`.
- **Bulb:** turns on automatically when temperature < `temperatureMin`.
- **Buzzer:** sounds automatically when gas level > `gasThreshold`.

## Notes

- Set `DEV_MODE` to `true` for local development over HTTP, or `false` for HTTPS production deployments.
- The hardware API key in `config.h` must match the value expected by the backend hardware-authenticated routes.
- See the backend README in [`smarthen-backend/README.md`](../smarthen-backend/README.md) for API details, environment setup, and seeding the admin account.
