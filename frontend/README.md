# WiFi Configuration Interface

A web interface for configuring WiFi on ESP32 devices, designed to run on a Raspberry Pi.

## Features

- Real-time WiFi network scanning
- Secure password entry
- Connection status feedback
- MQTT communication with ESP32
- Responsive design inspired by Dione Protocol

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure MQTT settings:
   - Edit `src/config.ts` to match your ESP32 MQTT broker settings

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## ESP32 Requirements

The ESP32 should be configured to:
- Run an MQTT broker or connect to the same broker as this interface
- Publish WiFi scan results to the topic `esp32/wifi/list`
- Subscribe to connection requests on `esp32/wifi/connect`
- Publish connection status to `esp32/wifi/status`

## Data Format

### WiFi List (ESP32 → Interface)
```json
[
  {
    "ssid": "Network1",
    "rssi": -65,
    "secure": true
  },
  {
    "ssid": "Network2",
    "rssi": -72,
    "secure": false
  }
]
```

### WiFi Connect (Interface → ESP32)
```json
{
  "ssid": "Network1",
  "password": "password123"
}
```

### WiFi Status (ESP32 → Interface)
```json
{
  "connected": true,
  "ssid": "Network1"
}
```
or
```json
{
  "connected": false,
  "message": "Authentication failed"
}
```